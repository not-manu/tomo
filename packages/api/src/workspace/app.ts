import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { DbAPI } from "../api/db/api";
import type { Middleware } from "../api/middleware";
import { MiddlewareAPI } from "../api/middleware/api";
import { Sandbox } from "../sandbox";
import { SandboxAPI } from "../sandbox/api";
import { Workspace } from ".";
import { WorkspaceAPI } from "./api";
import { Invite } from "./invite";
import { InviteAPI } from "./invite/api";

const Path = z.object({ path: z.string().default("/") });

const one = new Hono<Middleware.IsMember>()
	.use(MiddlewareAPI.isMember)
	.onError((error, c) => {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === "ENOENT" || code === "ENOTDIR") return c.json({ message: "Not found" }, 404);
		if (error.message === "Path escapes workspace") return c.json({ message: error.message }, 400);
		if (error.message === "Already a member") return c.json({ message: error.message }, 409);
		console.error(error);
		return c.json({ message: "Internal error" }, 500);
	})
	.get("/", (c) => c.json({ ...c.get("workspace"), role: c.get("member").role }))
	.patch("/", MiddlewareAPI.isOwner, zValidator("json", Workspace.Update), (c) =>
		c.json(
			WorkspaceAPI.update(DbAPI.instance(), {
				workspace: c.get("workspace"),
				input: c.req.valid("json"),
			}),
		),
	)
	.delete("/", MiddlewareAPI.isOwner, async (c) => {
		await WorkspaceAPI.remove(DbAPI.instance(), c.get("workspace"));
		return c.json({ ok: true });
	})
	.post("/leave", (c) => {
		if (c.get("member").role === "owner") {
			return c.json({ message: "Owners cannot leave; delete the workspace instead" }, 400);
		}
		WorkspaceAPI.leave(DbAPI.instance(), {
			workspace: c.get("workspace"),
			user: c.get("identity").user,
		});
		return c.json({ ok: true });
	})
	.get("/members", (c) => c.json(WorkspaceAPI.members(DbAPI.instance(), c.get("workspace"))))
	.get("/invites", (c) => c.json(InviteAPI.list(DbAPI.instance(), c.get("workspace"))))
	.post("/invites", zValidator("json", Invite.Create), (c) =>
		c.json(
			InviteAPI.create(DbAPI.instance(), {
				workspace: c.get("workspace"),
				invitedBy: c.get("identity").user,
				input: c.req.valid("json"),
			}),
			201,
		),
	)
	.delete("/invites/:inviteId", (c) => {
		const db = DbAPI.instance();
		const invite = InviteAPI.get(db, { id: c.req.param("inviteId") });
		if (!invite || invite.workspaceId !== c.get("workspace").id) {
			return c.json({ message: "Not found" }, 404);
		}
		InviteAPI.revoke(db, invite);
		return c.json({ ok: true });
	})
	.get("/files", zValidator("query", Path), (c) =>
		c.json(SandboxAPI.list(c.get("workspace").id, c.req.valid("query").path)),
	)
	.get("/files/content", zValidator("query", Path), (c) =>
		c.body(new Uint8Array(SandboxAPI.read(c.get("workspace").id, c.req.valid("query").path)), 200, {
			"Content-Type": "application/octet-stream",
		}),
	)
	.put("/files", zValidator("query", Path), async (c) => {
		const data = new Uint8Array(await c.req.arrayBuffer());
		SandboxAPI.write(c.get("workspace").id, c.req.valid("query").path, data);
		return c.json({ ok: true });
	})
	.delete("/files", zValidator("query", Path), (c) => {
		SandboxAPI.unlink(c.get("workspace").id, c.req.valid("query").path);
		return c.json({ ok: true });
	})
	.post("/mkdir", zValidator("json", Path), (c) => {
		SandboxAPI.mkdir(c.get("workspace").id, c.req.valid("json").path);
		return c.json({ ok: true });
	})
	.post("/run", zValidator("json", Sandbox.Run), async (c) =>
		c.json(await SandboxAPI.run(c.get("workspace").id, c.req.valid("json"))),
	);

const app = new Hono<Middleware.IsAuthenticated>()
	.use(MiddlewareAPI.isAuthenticated)
	.get("/", (c) => c.json(WorkspaceAPI.list(DbAPI.instance(), { user: c.get("identity").user })))
	.post("/", zValidator("json", Workspace.Create), (c) =>
		c.json(
			WorkspaceAPI.create(DbAPI.instance(), {
				owner: c.get("identity").user,
				input: c.req.valid("json"),
			}),
			201,
		),
	)
	.route("/:id", one);

export default app;
