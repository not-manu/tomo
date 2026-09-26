import { Hono } from "hono";
import { DbAPI } from "../../api/db/api";
import type { Middleware } from "../../api/middleware";
import { MiddlewareAPI } from "../../api/middleware/api";
import { SyncAPI } from "../../sync/api";
import { Workspace } from "..";
import { Invite } from ".";
import { InviteAPI } from "./api";

const app = new Hono<Middleware.IsAuthenticated>()
	.use(MiddlewareAPI.isAuthenticated)
	.get("/", (c) => c.json(InviteAPI.inbox(DbAPI.instance(), { user: c.get("identity").user })))
	.post("/:id/accept", (c) => {
		const user = c.get("identity").user;
		const workspace = InviteAPI.accept(DbAPI.instance(), {
			invite: { id: c.req.param("id") },
			user,
		});
		if (!workspace) return c.json({ message: "Not found" }, 404);
		SyncAPI.push({ workspace }, Workspace.Events.members, { workspaceId: workspace.id });
		SyncAPI.push({ workspace }, Invite.Events.workspace, { workspaceId: workspace.id });
		SyncAPI.push({ users: [user.id] }, Invite.Events.inbox, {});
		return c.json(workspace);
	})
	.post("/:id/decline", (c) => {
		const user = c.get("identity").user;
		const invite = InviteAPI.decline(DbAPI.instance(), { invite: { id: c.req.param("id") }, user });
		if (!invite) return c.json({ message: "Not found" }, 404);
		const workspace = { id: invite.workspaceId };
		SyncAPI.push({ workspace }, Invite.Events.workspace, { workspaceId: workspace.id });
		SyncAPI.push({ users: [user.id] }, Invite.Events.inbox, {});
		return c.json({ ok: true });
	});

export default app;
