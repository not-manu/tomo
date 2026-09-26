import type { ServerType } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import type { WebSocket } from "ws";

const root = new Hono();
const node = createNodeWebSocket({ app: root });

export namespace SocketAPI {
	export type Context = WSContext<WebSocket>;

	export const upgrade = node.upgradeWebSocket;

	export function inject(server: ServerType, app: Hono) {
		root.route("/", app);
		node.injectWebSocket(server);
	}

	export function keepAlive(ws: Context, interval = 25_000) {
		const raw = ws.raw;
		if (!raw) return;
		let alive = true;
		raw.on("pong", () => {
			alive = true;
		});
		const timer = setInterval(() => {
			if (!alive) return raw.terminate();
			alive = false;
			raw.ping();
		}, interval);
		raw.on("close", () => clearInterval(timer));
	}
}
