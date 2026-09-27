import type { SocketAPI } from "../../api/socket/api";
import { Sync } from "../../sync";
import { SyncAPI } from "../../sync/api";
import { Presence } from ".";

type Peer = { ws: SocketAPI.Context; cursor: Presence.Cursor; desktopId: string | null };

export namespace PresenceAPI {
	const rooms = new Map<string, Map<string, Peer>>();

	export function online(workspaceId: string): Presence.User[] {
		const users = new Map<string, Presence.User>();
		for (const { cursor } of rooms.get(workspaceId)?.values() ?? []) {
			users.set(cursor.user.id, cursor.user);
		}
		return [...users.values()];
	}

	export function viewers(workspaceId: string): Presence.Viewers {
		const desktops: Record<string, Map<string, Presence.User>> = {};
		for (const { cursor, desktopId } of rooms.get(workspaceId)?.values() ?? []) {
			if (!desktopId) continue;
			desktops[desktopId] ??= new Map();
			desktops[desktopId].set(cursor.user.id, cursor.user);
		}
		return Object.fromEntries(
			Object.entries(desktops).map(([id, users]) => [id, [...users.values()]]),
		);
	}

	export function join(workspaceId: string, peer: Omit<Peer, "desktopId">) {
		const room = rooms.get(workspaceId) ?? new Map<string, Peer>();
		rooms.set(workspaceId, room);
		changed(workspaceId, () => room.set(peer.cursor.id, { ...peer, desktopId: null }));
		peer.ws.send(Sync.encode(Presence.Events.viewers, { desktops: viewers(workspaceId) }));
	}

	export function view(workspaceId: string, id: string, desktopId: string) {
		const peer = rooms.get(workspaceId)?.get(id);
		if (!peer || peer.desktopId === desktopId) return;
		send(workspaceId, id, peer.desktopId, Sync.encode(Presence.Events.leave, { id }));
		peer.desktopId = desktopId;
		peer.cursor = { ...peer.cursor, point: null };
		for (const [otherId, other] of rooms.get(workspaceId) ?? []) {
			if (otherId !== id && other.desktopId === desktopId && other.cursor.point) {
				peer.ws.send(Sync.encode(Presence.Events.cursor, other.cursor));
			}
		}
		broadcastViewers(workspaceId);
	}

	export function move(workspaceId: string, id: string, point: Presence.Point | null) {
		const peer = rooms.get(workspaceId)?.get(id);
		if (!peer?.desktopId) return;
		peer.cursor = { ...peer.cursor, point };
		send(workspaceId, id, peer.desktopId, Sync.encode(Presence.Events.cursor, peer.cursor));
	}

	export function relay(workspaceId: string, id: string, encode: (user: Presence.User) => string) {
		const peer = rooms.get(workspaceId)?.get(id);
		if (peer) send(workspaceId, id, peer.desktopId, encode(peer.cursor.user));
	}

	export function leave(workspaceId: string, id: string) {
		const room = rooms.get(workspaceId);
		const peer = room?.get(id);
		if (!room || !peer) return;
		changed(workspaceId, () => room.delete(id));
		if (room.size === 0) return rooms.delete(workspaceId);
		send(workspaceId, id, peer.desktopId, Sync.encode(Presence.Events.leave, { id }));
		broadcastViewers(workspaceId);
	}

	export function evict(workspaceId: string, desktopId: string) {
		for (const peer of rooms.get(workspaceId)?.values() ?? []) {
			if (peer.desktopId === desktopId) peer.desktopId = null;
		}
		broadcastViewers(workspaceId);
	}

	function changed(workspaceId: string, mutate: () => void) {
		const before = online(workspaceId).length;
		mutate();
		if (online(workspaceId).length === before) return;
		SyncAPI.push({ workspace: { id: workspaceId } }, Presence.Events.online, { workspaceId });
	}

	function broadcastViewers(workspaceId: string) {
		const message = Sync.encode(Presence.Events.viewers, { desktops: viewers(workspaceId) });
		for (const peer of rooms.get(workspaceId)?.values() ?? []) peer.ws.send(message);
	}

	function send(workspaceId: string, from: string, desktopId: string | null, message: string) {
		if (!desktopId) return;
		for (const [id, peer] of rooms.get(workspaceId) ?? []) {
			if (id !== from && peer.desktopId === desktopId) peer.ws.send(message);
		}
	}
}
