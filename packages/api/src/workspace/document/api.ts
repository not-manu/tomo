import * as Y from "yjs";
import type { SocketAPI } from "../../api/socket/api";
import { Sandbox } from "../../sandbox";
import { SandboxAPI } from "../../sandbox/api";
import { Sync } from "../../sync";
import { SyncAPI } from "../../sync/api";
import { Document } from ".";

type Open = {
	workspaceId: string;
	path: string;
	doc: Y.Doc;
	peers: Set<SocketAPI.Context>;
	timer: NodeJS.Timeout | undefined;
	expiry: NodeJS.Timeout | undefined;
	modified: number;
};

export namespace DocumentAPI {
	const docs = new Map<string, Open>();

	const key = (workspaceId: string, path: string) => `${workspaceId}:${path}`;

	function load(workspaceId: string, path: string) {
		const existing = docs.get(key(workspaceId, path));
		if (existing && (existing.peers.size > 0 || fresh(existing))) return existing;
		if (existing) discard(existing);
		const bytes = SandboxAPI.read(workspaceId, path);
		if (bytes.byteLength > Document.MaxBytes) throw new Error("File is too large to edit");
		if (bytes.includes(0)) throw new Error("Binary files can't be edited");
		const doc = new Y.Doc();
		doc.getText(Document.Field).insert(0, bytes.toString("utf8"));
		const open: Open = {
			workspaceId,
			path,
			doc,
			peers: new Set(),
			timer: undefined,
			expiry: undefined,
			modified: SandboxAPI.modified(workspaceId, path),
		};
		doc.on("update", (update: Uint8Array, origin: unknown) => {
			const message = Sync.encode(Document.Events.update, {
				path,
				update: Document.encode(update),
			});
			for (const peer of open.peers) if (peer !== origin) peer.send(message);
			clearTimeout(open.timer);
			open.timer = setTimeout(() => void save(open), 400);
		});
		docs.set(key(workspaceId, path), open);
		return open;
	}

	function fresh(open: Open) {
		try {
			return SandboxAPI.modified(open.workspaceId, open.path) === open.modified;
		} catch {
			return false;
		}
	}

	function discard(open: Open) {
		clearTimeout(open.expiry);
		clearTimeout(open.timer);
		if (docs.get(key(open.workspaceId, open.path)) === open) {
			docs.delete(key(open.workspaceId, open.path));
		}
		open.doc.destroy();
	}

	async function save(open: Open) {
		clearTimeout(open.timer);
		open.timer = undefined;
		const text = open.doc.getText(Document.Field).toString();
		try {
			await SandboxAPI.write(open.workspaceId, open.path, new TextEncoder().encode(text));
			open.modified = SandboxAPI.modified(open.workspaceId, open.path);
			SyncAPI.push({ workspace: { id: open.workspaceId } }, Sandbox.Events.changed, {
				workspaceId: open.workspaceId,
				path: open.path,
			});
		} catch (error) {
			console.error(`saving ${open.path} failed`, error);
		}
	}

	export function open(workspaceId: string, path: string, ws: SocketAPI.Context) {
		try {
			const open = load(workspaceId, path);
			clearTimeout(open.expiry);
			open.peers.add(ws);
			ws.send(
				Sync.encode(Document.Events.state, {
					path,
					update: Document.encode(Y.encodeStateAsUpdate(open.doc)),
				}),
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Couldn't open file";
			ws.send(Sync.encode(Document.Events.error, { path, message }));
		}
	}

	export function update(workspaceId: string, path: string, ws: SocketAPI.Context, data: string) {
		const open = docs.get(key(workspaceId, path));
		if (open?.peers.has(ws)) Y.applyUpdate(open.doc, Document.decode(data), ws);
	}

	export function awareness(
		workspaceId: string,
		path: string,
		ws: SocketAPI.Context,
		data: string,
	) {
		const open = docs.get(key(workspaceId, path));
		if (!open?.peers.has(ws)) return;
		const message = Sync.encode(Document.Events.awareness, { path, update: data });
		for (const peer of open.peers) if (peer !== ws) peer.send(message);
	}

	export function close(workspaceId: string, path: string, ws: SocketAPI.Context) {
		const open = docs.get(key(workspaceId, path));
		if (!open?.peers.delete(ws) || open.peers.size > 0) return;
		if (open.timer) void save(open);
		open.expiry = setTimeout(() => {
			if (open.peers.size === 0) discard(open);
		}, 60_000);
	}

	export function closeAll(workspaceId: string, ws: SocketAPI.Context) {
		for (const open of [...docs.values()]) {
			if (open.workspaceId === workspaceId && open.peers.has(ws)) {
				close(workspaceId, open.path, ws);
			}
		}
	}
}
