import { Presence, Sync } from "@tomo/api";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useEffectEvent,
	useMemo,
	useRef,
	useState,
} from "react";
import { hono } from "~/lib/hono";
import { socket } from "~/lib/socket";

type Listener = (message: Sync.Message) => void;

export type Live = {
	connection: number;
	send: <E extends Sync.Event>(event: E, data: Sync.Data<E>) => void;
	listen: (listener: Listener) => () => void;
};

const LiveContext = createContext<Live | null>(null);

export const LiveProvider = LiveContext.Provider;

export function useLiveConnection(id: string, desktopId: string | undefined) {
	const [cursors, setCursors] = useState<Record<string, Presence.Cursor>>({});
	const [viewers, setViewers] = useState<Presence.Viewers>({});
	const [connection, setConnection] = useState(0);
	const ws = useRef<ReturnType<typeof socket>>(undefined);
	const listeners = useRef(new Set<Listener>());
	const desktop = useRef(desktopId);
	const frame = useRef<number>(undefined);
	const pending = useRef<Presence.Point | null>(null);

	const send = useCallback(<E extends Sync.Event>(event: E, data: Sync.Data<E>) => {
		ws.current?.send(Sync.encode(event, data));
	}, []);

	useEffect(() => {
		ws.current = socket({
			open: () => hono.api.workspace[":id"].presence.$ws({ param: { id } }),
			onOpen: () => {
				if (desktop.current) {
					ws.current?.send(Sync.encode(Presence.Events.view, { desktopId: desktop.current }));
				}
				setConnection((count) => count + 1);
			},
			onMessage: (raw) => {
				const message = Sync.parse(raw);
				if (!message) return;
				for (const listener of listeners.current) listener(message);
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
			ws.current?.close();
			if (frame.current) cancelAnimationFrame(frame.current);
		};
	}, [id]);

	useEffect(() => {
		if (!desktopId || desktop.current === desktopId) return;
		desktop.current = desktopId;
		setCursors({});
		ws.current?.send(Sync.encode(Presence.Events.view, { desktopId }));
	}, [desktopId]);

	const move = useCallback((point: Presence.Point | null) => {
		pending.current = point;
		frame.current ??= requestAnimationFrame(() => {
			frame.current = undefined;
			ws.current?.send(Sync.encode(Presence.Events.move, { point: pending.current }));
		});
	}, []);

	const listen = useCallback((listener: Listener) => {
		listeners.current.add(listener);
		return () => {
			listeners.current.delete(listener);
		};
	}, []);

	const live = useMemo<Live>(() => ({ connection, send, listen }), [connection, send, listen]);

	return { cursors: Object.values(cursors), viewers, move, live };
}

export function useLive() {
	const live = useContext(LiveContext);
	if (!live) throw new Error("useLive must be used inside LiveProvider");
	return live;
}

export function useLiveEvent<E extends Sync.Event>(
	event: E,
	handler: (data: Sync.Data<E>) => void,
) {
	const { listen } = useLive();
	const onEvent = useEffectEvent(handler);

	useEffect(
		() =>
			listen((message) => {
				const data = Sync.decode(event, message);
				if (data !== undefined) onEvent(data);
			}),
		[listen, event],
	);
}
