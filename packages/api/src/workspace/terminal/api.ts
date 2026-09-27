import { StringDecoder } from "node:string_decoder";
import serializeModule from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import type { Docker } from "../../api/docker";
import type { SocketAPI } from "../../api/socket/api";
import { SandboxAPI } from "../../sandbox/api";
import { Sync } from "../../sync";
import { Terminal } from ".";

type Peer = { size: Terminal.Size; backlog: string[] | null };

type Session = {
	windowId: string;
	pty: Docker.Pty;
	term: InstanceType<typeof headless.Terminal>;
	serializer: InstanceType<typeof serializeModule.SerializeAddon>;
	size: Terminal.Size;
	peers: Map<SocketAPI.Context, Peer>;
	pending: string;
	timer: NodeJS.Timeout | undefined;
	since: number;
	fitTimer: NodeJS.Timeout | undefined;
	closed: boolean;
};

export namespace TerminalAPI {
	const starting = new Map<string, Promise<Session>>();
	const live = new Map<string, Session>();

	const Quiet = 4;
	const MaxDelay = 32;
	const MaxSyncDelay = 120;
	const SyncStart = "\x1b[?2026h";
	const SyncEnd = "\x1b[?2026l";

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
			pending: "",
			timer: undefined,
			since: 0,
			fitTimer: undefined,
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
		if (!s.pending) s.since = Date.now();
		s.pending += text;
		const age = Date.now() - s.since;
		const syncing = s.pending.lastIndexOf(SyncStart) > s.pending.lastIndexOf(SyncEnd);
		const delay = syncing ? MaxSyncDelay - age : Math.min(Quiet, MaxDelay - age);
		clearTimeout(s.timer);
		s.timer = setTimeout(() => flush(s), Math.max(0, delay));
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

	function broadcast(s: Session, message: string) {
		for (const [ws, peer] of s.peers) {
			if (!peer.backlog) ws.send(message);
		}
	}

	function ended(s: Session) {
		if (s.closed) return;
		s.closed = true;
		flush(s);
		broadcast(s, Sync.encode(Terminal.Events.exit, { windowId: s.windowId }));
		clearTimeout(s.fitTimer);
		s.term.dispose();
		if (live.get(s.windowId) === s) {
			live.delete(s.windowId);
			starting.delete(s.windowId);
		}
	}

	function fit(s: Session) {
		clearTimeout(s.fitTimer);
		s.fitTimer = undefined;
		const sizes = [...s.peers.values()].map((peer) => peer.size);
		if (sizes.length === 0) return;
		const size = {
			cols: Math.min(...sizes.map((next) => next.cols)),
			rows: Math.min(...sizes.map((next) => next.rows)),
		};
		if (size.cols === s.size.cols && size.rows === s.size.rows) return;
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
		fit(s);
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
		if (s?.peers.delete(ws)) fit(s);
	}

	export function detachAll(ws: SocketAPI.Context) {
		for (const windowId of live.keys()) detach(windowId, ws);
	}

	export async function input(windowId: string, ws: SocketAPI.Context, data: string) {
		const s = await starting.get(windowId)?.catch(() => undefined);
		if (s && !s.closed && s.peers.has(ws)) s.pty.stream.write(data);
	}

	export function resize(windowId: string, ws: SocketAPI.Context, size: Terminal.Size) {
		const s = live.get(windowId);
		const peer = s?.peers.get(ws);
		if (!s || !peer) return;
		peer.size = size;
		clearTimeout(s.fitTimer);
		s.fitTimer = setTimeout(() => fit(s), 100);
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
