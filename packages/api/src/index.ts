import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import app from "./api/app";
import { DbAPI } from "./api/db/api";
import { Env } from "./api/env";
import { SocketAPI } from "./api/socket/api";

DbAPI.migrate(DbAPI.instance());

const server = new Hono()
	.route("/", app)
	.use("*", serveStatic({ root: "../web/build/client" }))
	.get("*", serveStatic({ path: "../web/build/client/index.html" }));

SocketAPI.inject(
	serve({ fetch: server.fetch, port: Env.PORT }, (info) => {
		console.log(`listening on http://localhost:${info.port}`);
	}),
	server,
);
