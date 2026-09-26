import { Hono } from "hono";
import { DbAPI } from "../../api/db/api";
import type { Middleware } from "../../api/middleware";
import { MiddlewareAPI } from "../../api/middleware/api";
import { InviteAPI } from "./api";

const app = new Hono<Middleware.IsAuthenticated>()
	.use(MiddlewareAPI.isAuthenticated)
	.get("/", (c) => c.json(InviteAPI.inbox(DbAPI.instance(), { user: c.get("identity").user })))
	.post("/:id/accept", (c) => {
		const workspace = InviteAPI.accept(DbAPI.instance(), {
			invite: { id: c.req.param("id") },
			user: c.get("identity").user,
		});
		if (!workspace) return c.json({ message: "Not found" }, 404);
		return c.json(workspace);
	})
	.post("/:id/decline", (c) => {
		const ok = InviteAPI.decline(DbAPI.instance(), {
			invite: { id: c.req.param("id") },
			user: c.get("identity").user,
		});
		if (!ok) return c.json({ message: "Not found" }, 404);
		return c.json({ ok: true });
	});

export default app;
