import { StringDecoder } from "node:string_decoder";
import serializeModule from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import type { Docker } from "../../api/docker";
import type { SocketAPI } from "../../api/socket/api";
import { SandboxAPI } from "../../sandbox/api";
import { Sync } from "../../sync";
import type { Presence } from "../presence";
import { Terminal } from ".";

type Peer = { size: Terminal.Size; backlog: string[] | null };

type Session = {
	windowId: string;
	pty: Docker.Pty;
	term: InstanceType<typeof headless.Terminal>;
	serializer: InstanceType<typeof serializeModule.SerializeAddon>;
	size: Terminal.Size;
	peers: Map<SocketAPI.Context, Peer>;
	driver: SocketAPI.Context | undefined;
	pending: string;
	timer: NodeJS.Timeout | undefined;
	typed: Map<string, number>;
	closed: boolean;
};

export namespace TerminalAPI {
	const starting = new Map<string, Promise<Session>>();
	const live = new Map<string, Session>();

	const pidFile = (windowId: string) => `/tmp/.tomo-${windowId}.pid`;

	const codexLogin =
		'[ -n "$OPENAI_API_KEY" ] && printenv OPENAI_API_KEY | codex login --with-api-key >/dev/null 2>&1';

	function session(workspaceId: string, windowId: string, size: Terminal.Size) {
		const current = starting.get(windowId);
		if (current) return current;
		const pending = spawn(workspaceId, windowId, size).catch((error) => {
			starting.delete(windowId);
			throw error;
		});
		starting.set(windowId, pending);
		return pending;
	}

	async function spawn(workspaceId: string, windowId: string, size: Terminal.Size) {
		const pty = await SandboxAPI.shell(workspaceId, {
			cmd: ["bash", "-c", `echo $$ > ${pidFile(windowId)}; ${codexLogin}; exec bash -l`],
			size,
		});
		const term = new headless.Terminal({ ...size, scrollback: 2000, allowProposedApi: true });
		const serializer = new serializeModule.SerializeAddon();
		term.loadAddon(serializer);
		const s: Session = {
			windowId,
			pty,
			term,
			serializer,
			size,
			peers: new Map(),
			driver: undefined,
			pending: "",
			timer: undefined,
			typed: new Map(),
			closed: false,
		};
		const decoder = new StringDecoder("utf8");
		pty.stream.on("data", (chunk: Buffer) => {
			const text = decoder.write(chunk);
			if (text) output(s, text);
		});
		pty.stream.on("end", () => ended(s));
		pty.stream.on("close", () => ended(s));
		pty.stream.on("error", () => ended(s));
		live.set(windowId, s);
		return s;
	}

	function output(s: Session, text: string) {
		s.term.write(text);
		s.pending += text;
		s.timer ??= setTimeout(() => flush(s), 16);
	}

	function flush(s: Session) {
		clearTimeout(s.timer);
		s.timer = undefined;
		if (!s.pending) return;
		const data = s.pending;
		s.pending = "";
		const message = Sync.encode(Terminal.Events.output, { windowId: s.windowId, data });
		for (const [ws, peer] of s.peers) {
			if (peer.backlog) peer.backlog.push(data);
			else ws.send(message);
		}
	}

	function broadcast(s: Session, message: string, except?: SocketAPI.Context) {
		for (const [ws, peer] of s.peers) {
			if (ws !== except && !peer.backlog) ws.send(message);
		}
	}

	function ended(s: Session) {
		if (s.closed) return;
		s.closed = true;
		flush(s);
		broadcast(s, Sync.encode(Terminal.Events.exit, { windowId: s.windowId }));
		s.term.dispose();
		if (live.get(s.windowId) === s) {
			live.delete(s.windowId);
			starting.delete(s.windowId);
		}
	}

	function drive(s: Session, ws: SocketAPI.Context | undefined) {
		s.driver = ws;
		const size = ws && s.peers.get(ws)?.size;
		if (!size || (size.cols === s.size.cols && size.rows === s.size.rows)) return;
		flush(s);
		s.size = size;
		s.term.resize(size.cols, size.rows);
		void s.pty.resize(size);
		broadcast(s, Sync.encode(Terminal.Events.size, { windowId: s.windowId, size }));
	}

	export async function attach(args: {
		workspaceId: string;
		windowId: string;
		ws: SocketAPI.Context;
		size: Terminal.Size;
	}) {
		const s = await session(args.workspaceId, args.windowId, args.size);
		if (s.closed) return;
		flush(s);
		const peer: Peer = { size: args.size, backlog: [] };
		s.peers.set(args.ws, peer);
		if (!s.driver || !s.peers.has(s.driver)) drive(s, args.ws);
		await new Promise<void>((done) => s.term.write("", done));
		if (s.peers.get(args.ws) !== peer || s.closed) return;
		args.ws.send(
			Sync.encode(Terminal.Events.snapshot, {
				windowId: s.windowId,
				data: s.serializer.serialize(),
				size: s.size,
			}),
		);
		const data = peer.backlog?.join("") ?? "";
		if (data) args.ws.send(Sync.encode(Terminal.Events.output, { windowId: s.windowId, data }));
		peer.backlog = null;
	}

	export function detach(windowId: string, ws: SocketAPI.Context) {
		const s = live.get(windowId);
		if (!s?.peers.delete(ws) || s.driver !== ws) return;
		drive(s, s.peers.keys().next().value);
	}

	export function detachAll(ws: SocketAPI.Context) {
		for (const windowId of live.keys()) detach(windowId, ws);
	}

	export function input(args: {
		windowId: string;
		ws: SocketAPI.Context;
		user: Presence.User;
		data: string;
	}) {
		const s = live.get(args.windowId);
		if (!s?.peers.has(args.ws)) return;
		s.pty.stream.write(args.data);
		if (s.driver !== args.ws) drive(s, args.ws);
		const now = Date.now();
		if (now - (s.typed.get(args.user.id) ?? 0) < 400) return;
		s.typed.set(args.user.id, now);
		broadcast(
			s,
			Sync.encode(Terminal.Events.typing, { windowId: s.windowId, user: args.user }),
			args.ws,
		);
	}

	export function resize(windowId: string, ws: SocketAPI.Context, size: Terminal.Size) {
		const s = live.get(windowId);
		const peer = s?.peers.get(ws);
		if (!s || !peer) return;
		peer.size = size;
		if (s.driver === ws) drive(s, ws);
	}

	export async function close(workspaceId: string, windowId: string) {
		const s = live.get(windowId);
		const pid = pidFile(windowId);
		await SandboxAPI.exec(workspaceId, [
			"sh",
			"-c",
			`kill -HUP "$(cat ${pid})" 2>/dev/null; rm -f ${pid}`,
		]).catch(() => undefined);
		if (s) {
			s.pty.stream.end();
			ended(s);
		}
	}
}
