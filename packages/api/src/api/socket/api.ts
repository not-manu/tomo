import { EventEmitter } from "node:events";
import type { IncomingMessage, Server } from "node:http";
import type { Duplex } from "node:stream";
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

	export function inject(
		server: Server,
		app: Hono,
		intercept: (request: IncomingMessage, socket: Duplex, head: Buffer) => boolean,
	) {
		root.route("/", app);
		const upgrades = new EventEmitter();
		node.injectWebSocket(upgrades as unknown as ServerType);
		server.on("upgrade", (request, socket, head) => {
			if (!intercept(request, socket, head)) upgrades.emit("upgrade", request, socket, head);
		});
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
