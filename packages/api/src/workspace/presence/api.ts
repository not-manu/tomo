import type { SocketAPI } from "../../api/socket/api";
import { Sync } from "../../sync";
import { SyncAPI } from "../../sync/api";
import { Presence } from ".";

type Peer = { ws: SocketAPI.Context; cursor: Presence.Cursor };

export namespace PresenceAPI {
	const rooms = new Map<string, Map<string, Peer>>();

	export function online(workspaceId: string): Presence.User[] {
		const users = new Map<string, Presence.User>();
		for (const { cursor } of rooms.get(workspaceId)?.values() ?? []) {
			users.set(cursor.user.id, cursor.user);
		}
		return [...users.values()];
	}

	export function join(workspaceId: string, peer: Peer) {
		const room = rooms.get(workspaceId) ?? new Map<string, Peer>();
		rooms.set(workspaceId, room);
		for (const other of room.values()) {
			if (other.cursor.point) peer.ws.send(Sync.encode(Presence.Events.cursor, other.cursor));
		}
		changed(workspaceId, () => room.set(peer.cursor.id, peer));
	}

	export function receive(workspaceId: string, id: string, raw: unknown) {
		const peer = rooms.get(workspaceId)?.get(id);
		const message = Sync.parse(raw);
		const move = message && Sync.decode(Presence.Events.move, message);
		if (!peer || !move) return;
		peer.cursor = { ...peer.cursor, point: move.point };
		broadcast(workspaceId, id, Sync.encode(Presence.Events.cursor, peer.cursor));
	}

	export function leave(workspaceId: string, id: string) {
		const room = rooms.get(workspaceId);
		if (!room?.has(id)) return;
		changed(workspaceId, () => room.delete(id));
		if (room.size === 0) rooms.delete(workspaceId);
		else broadcast(workspaceId, id, Sync.encode(Presence.Events.leave, { id }));
	}

	function changed(workspaceId: string, mutate: () => void) {
		const before = online(workspaceId).length;
		mutate();
		if (online(workspaceId).length === before) return;
		SyncAPI.push({ workspace: { id: workspaceId } }, Presence.Events.online, { workspaceId });
	}

	function broadcast(workspaceId: string, from: string, message: string) {
		for (const [id, peer] of rooms.get(workspaceId) ?? []) {
			if (id !== from) peer.ws.send(message);
		}
	}
}
