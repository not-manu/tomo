import { Presence, Sync } from "@tomo/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { hono } from "~/lib/hono";
import { socket } from "~/lib/socket";

export function usePresence(id: string, desktopId: string | undefined) {
	const [cursors, setCursors] = useState<Record<string, Presence.Cursor>>({});
	const [viewers, setViewers] = useState<Presence.Viewers>({});
	const connection = useRef<ReturnType<typeof socket>>(undefined);
	const desktop = useRef(desktopId);
	const frame = useRef<number>(undefined);
	const pending = useRef<Presence.Point | null>(null);

	useEffect(() => {
		const view = () => {
			if (desktop.current) {
				connection.current?.send(Sync.encode(Presence.Events.view, { desktopId: desktop.current }));
			}
		};
		connection.current = socket({
			open: () => hono.api.workspace[":id"].presence.$ws({ param: { id } }),
			onOpen: view,
			onMessage: (raw) => {
				const message = Sync.parse(raw);
				if (!message) return;
				const cursor = Sync.decode(Presence.Events.cursor, message);
				if (cursor) setCursors((all) => ({ ...all, [cursor.id]: cursor }));
				const leave = Sync.decode(Presence.Events.leave, message);
				if (leave) setCursors(({ [leave.id]: _, ...rest }) => rest);
				const snapshot = Sync.decode(Presence.Events.viewers, message);
				if (snapshot) setViewers(snapshot.desktops);
			},
			onClose: () => {
				setCursors({});
				setViewers({});
			},
		});
		return () => {
			connection.current?.close();
			if (frame.current) cancelAnimationFrame(frame.current);
		};
	}, [id]);

	useEffect(() => {
		if (!desktopId || desktop.current === desktopId) return;
		desktop.current = desktopId;
		setCursors({});
		connection.current?.send(Sync.encode(Presence.Events.view, { desktopId }));
	}, [desktopId]);

	const move = useCallback((point: Presence.Point | null) => {
		pending.current = point;
		frame.current ??= requestAnimationFrame(() => {
			frame.current = undefined;
			connection.current?.send(Sync.encode(Presence.Events.move, { point: pending.current }));
		});
	}, []);

	return { cursors: Object.values(cursors), viewers, move };
}
