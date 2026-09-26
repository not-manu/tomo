import { useQueryClient } from "@tanstack/react-query";
import { Sync } from "@tomo/api";
import { useEffect, useEffectEvent } from "react";
import { hono } from "~/lib/hono";
import { socket } from "~/lib/socket";

const handlers = new Map<string, Set<(message: Sync.Message) => void>>();

export function useSyncConnection(enabled: boolean) {
	const client = useQueryClient();

	useEffect(() => {
		if (!enabled) return;
		const connection = socket({
			open: () => hono.api.sync.$ws(),
			onMessage: (raw) => {
				const message = Sync.parse(raw);
				if (!message) return;
				for (const handler of handlers.get(message.type) ?? []) handler(message);
			},
			onReconnect: () => client.invalidateQueries(),
		});
		return () => connection.close();
	}, [enabled, client]);
}

export function useSync<E extends Sync.Event>(event: E, handler: (data: Sync.Data<E>) => void) {
	const onEvent = useEffectEvent(handler);

	useEffect(() => {
		const listener = (message: Sync.Message) => {
			const data = Sync.decode(event, message);
			if (data !== undefined) onEvent(data);
		};
		const set = handlers.get(event.type) ?? new Set();
		handlers.set(event.type, set.add(listener));
		return () => {
			set.delete(listener);
		};
	}, [event]);
}
