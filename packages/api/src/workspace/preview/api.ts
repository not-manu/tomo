import {
	Agent,
	request as forward,
	type IncomingHttpHeaders,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import { type AddressInfo, connect, createServer } from "node:net";
import type { Duplex } from "node:stream";
import { DbAPI } from "../../api/db/api";
import { SandboxAPI } from "../../sandbox/api";
import { WorkspaceAPI } from "../api";
import { Preview } from ".";

export namespace PreviewAPI {
	const agent = new Agent({ keepAlive: true, maxSockets: 32, timeout: 4_000 });
	const bridges = new Map<string, Promise<number>>();
	const HopByHop = ["connection", "keep-alive", "proxy-connection", "upgrade"];

	export function target(req: IncomingMessage): Preview.Target | undefined {
		const found = Preview.parse(req.headers.host ?? "");
		if (!found) return undefined;
		return WorkspaceAPI.get(DbAPI.instance(), { id: found.workspaceId }) ? found : undefined;
	}

	function bridge(target: Preview.Target) {
		const key = `${target.workspaceId}:${target.port}`;
		const cached = bridges.get(key);
		if (cached) return cached;
		const pending = new Promise<number>((resolve, reject) => {
			const server = createServer((socket) => {
				socket.on("error", () => socket.destroy());
				SandboxAPI.connect(target.workspaceId, target.port, socket).catch(() => socket.destroy());
			});
			server.once("error", reject);
			server.listen(0, "127.0.0.1", () => resolve((server.address() as AddressInfo).port));
		});
		bridges.set(key, pending);
		pending.catch(() => bridges.delete(key));
		return pending;
	}

	function headers(req: IncomingMessage, target: Preview.Target, upgrade: boolean) {
		const next: IncomingHttpHeaders = {
			...req.headers,
			host: `localhost:${target.port}`,
			"x-forwarded-host": req.headers.host,
			"x-forwarded-proto": req.headers["x-forwarded-proto"] ?? "http",
		};
		if (!upgrade) for (const name of HopByHop) delete next[name];
		return next;
	}

	function origin(req: IncomingMessage) {
		return `${req.headers["x-forwarded-proto"] ?? "http"}://${req.headers.host}`;
	}

	function waiting(res: ServerResponse, port: number) {
		if (res.headersSent) return void res.destroy();
		res.writeHead(503, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
		res.end(
			`<!doctype html><meta http-equiv="refresh" content="1"><title>Waiting for :${port}</title><style>body{margin:0;height:100vh;display:grid;place-items:center;font:14px/1.5 Geist,system-ui,sans-serif;color:#6F6E69;background:#FFFCF0}@media(prefers-color-scheme:dark){body{background:#100F0F;color:#878580}}code{font-family:"Berkeley Mono",ui-monospace,monospace}</style><p>Waiting for something to run on <code>localhost:${port}</code>…</p>`,
		);
	}

	export async function request(req: IncomingMessage, res: ServerResponse, target: Preview.Target) {
		const port = await bridge(target).catch(() => undefined);
		if (!port) return waiting(res, target.port);
		const upstream = forward(
			{
				host: "127.0.0.1",
				port,
				agent,
				method: req.method,
				path: req.url,
				headers: headers(req, target, false),
			},
			(response) => {
				const location = response.headers.location;
				if (location) {
					response.headers.location = location.replace(
						/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/,
						origin(req),
					);
				}
				res.writeHead(response.statusCode ?? 502, response.headers);
				response.pipe(res);
			},
		);
		upstream.on("error", () => waiting(res, target.port));
		res.on("close", () => {
			if (!res.writableFinished) upstream.destroy();
		});
		req.pipe(upstream);
	}

	export async function upgrade(
		req: IncomingMessage,
		socket: Duplex,
		head: Buffer,
		target: Preview.Target,
	) {
		socket.on("error", () => socket.destroy());
		const port = await bridge(target).catch(() => undefined);
		if (!port) return void socket.destroy();
		const upstream = connect(port, "127.0.0.1", () => {
			const lines = [`${req.method} ${req.url} HTTP/1.1`];
			for (const [name, value] of Object.entries(headers(req, target, true))) {
				if (value === undefined) continue;
				for (const item of Array.isArray(value) ? value : [value]) lines.push(`${name}: ${item}`);
			}
			upstream.write(`${lines.join("\r\n")}\r\n\r\n`);
			if (head.length) upstream.write(head);
			upstream.pipe(socket);
			socket.pipe(upstream);
		});
		upstream.on("error", () => socket.destroy());
		upstream.on("close", () => socket.destroy());
		socket.on("close", () => upstream.destroy());
	}
}
