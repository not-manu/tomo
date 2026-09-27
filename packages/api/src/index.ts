import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import app from "./api/app";
import { DbAPI } from "./api/db/api";
import { Env } from "./api/env";
import { SocketAPI } from "./api/socket/api";
import { PreviewAPI } from "./workspace/preview/api";

DbAPI.migrate(DbAPI.instance());

const server = new Hono()
	.route("/", app)
	.use("*", serveStatic({ root: "../web/build/client" }))
	.get("*", serveStatic({ path: "../web/build/client/index.html" }));

const listener = getRequestListener(server.fetch);

const http = createServer((req, res) => {
	const target = PreviewAPI.target(req);
	if (target) return void PreviewAPI.request(req, res, target);
	void listener(req, res);
});

SocketAPI.inject(http, server, (req, socket, head) => {
	const target = PreviewAPI.target(req);
	if (target) void PreviewAPI.upgrade(req, socket, head, target);
	return target !== undefined;
});

http.listen(Env.PORT, () => console.log(`listening on http://localhost:${Env.PORT}`));
