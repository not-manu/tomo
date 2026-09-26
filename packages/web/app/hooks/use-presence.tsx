import { Presence, Sync } from "@tomo/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { hono } from "~/lib/hono";
import { socket } from "~/lib/socket";

export function usePresence(id: string) {
	const [cursors, setCursors] = useState<Record<string, Presence.Cursor>>({});
	const connection = useRef<ReturnType<typeof socket>>(undefined);
	const frame = useRef<number>(undefined);
	const pending = useRef<Presence.Point | null>(null);

	useEffect(() => {
		connection.current = socket({
			open: () => hono.api.workspace[":id"].presence.$ws({ param: { id } }),
			onMessage: (raw) => {
				const message = Sync.parse(raw);
				if (!message) return;
				const cursor = Sync.decode(Presence.Events.cursor, message);
				if (cursor) setCursors((all) => ({ ...all, [cursor.id]: cursor }));
				const leave = Sync.decode(Presence.Events.leave, message);
				if (leave) setCursors(({ [leave.id]: _, ...rest }) => rest);
			},
			onClose: () => setCursors({}),
		});
		return () => {
			connection.current?.close();
			if (frame.current) cancelAnimationFrame(frame.current);
		};
	}, [id]);

	const move = useCallback((point: Presence.Point | null) => {
		pending.current = point;
		frame.current ??= requestAnimationFrame(() => {
			frame.current = undefined;
			connection.current?.send(Sync.encode(Presence.Events.move, { point: pending.current }));
		});
	}, []);

	return { cursors: Object.values(cursors), move };
}
