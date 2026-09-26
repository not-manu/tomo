import { Hono } from "hono";
import type { Middleware } from "../api/middleware";
import { MiddlewareAPI } from "../api/middleware/api";
import { SocketAPI } from "../api/socket/api";
import { SyncAPI } from "./api";

const app = new Hono<Middleware.IsAuthenticated>().use(MiddlewareAPI.isAuthenticated).get(
	"/",
	SocketAPI.upgrade((c) => {
		const { id, email } = c.get("identity").user;
		let connection: SyncAPI.Connection | undefined;
		return {
			onOpen: (_, ws) => {
				connection = { user: { id, email }, ws };
				SyncAPI.connect(connection);
				SocketAPI.keepAlive(ws);
			},
			onClose: () => {
				if (connection) SyncAPI.disconnect(connection);
			},
		};
	}),
);

export default app;
