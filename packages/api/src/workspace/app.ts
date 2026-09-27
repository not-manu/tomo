import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { DbAPI } from "../api/db/api";
import type { Middleware } from "../api/middleware";
import { MiddlewareAPI } from "../api/middleware/api";
import { SocketAPI } from "../api/socket/api";
import { Core } from "../core";
import { Sandbox } from "../sandbox";
import { SandboxAPI } from "../sandbox/api";
import { Sync } from "../sync";
import { SyncAPI } from "../sync/api";
import { Workspace } from ".";
import { WorkspaceAPI } from "./api";
import { DesktopAPI } from "./desktop/api";
import desktopApp from "./desktop/app";
import { Invite } from "./invite";
import { InviteAPI } from "./invite/api";
import { Presence } from "./presence";
import { PresenceAPI } from "./presence/api";

const Path = z.object({ path: z.string().default("/") });

const one = new Hono<Middleware.IsMember>()
	.use(MiddlewareAPI.isMember)
	.onError((error, c) => {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === "ENOENT" || code === "ENOTDIR") return c.json({ message: "Not found" }, 404);
		if (error.message === "Path escapes workspace") return c.json({ message: error.message }, 400);
		if (error.message === "Already a member") return c.json({ message: error.message }, 409);
		if (error.message === "Storage limit reached") return c.json({ message: error.message }, 413);
		if (error.message === "Desktop limit reached") return c.json({ message: error.message }, 409);
		if (
			error.message === "Cannot remove the last desktop" ||
			error.message === "Order must include every desktop exactly once"
		) {
			return c.json({ message: error.message }, 400);
		}
		console.error(error);
		return c.json({ message: "Internal error" }, 500);
	})
	.get("/", (c) => {
		const workspace = c.get("workspace");
		return c.json({
			...workspace,
			role: c.get("member").role,
			online: PresenceAPI.online(workspace.id),
		});
	})
	.get(
		"/presence",
		SocketAPI.upgrade((c) => {
			const workspaceId = c.get("workspace").id;
			const { id: userId, name, image } = c.get("identity").user;
			const id = Core.Id();
			return {
				onOpen: (_, ws) => {
					PresenceAPI.join(workspaceId, {
						ws,
						cursor: { id, user: { id: userId, name, image }, point: null },
					});
					SocketAPI.keepAlive(ws);
				},
				onMessage: (event) => {
					const message = Sync.parse(event.data);
					if (!message) return;
					const move = Sync.decode(Presence.Events.move, message);
					if (move) return PresenceAPI.move(workspaceId, id, move.point);
					const view = Sync.decode(Presence.Events.view, message);
					const desktop =
						view &&
						DesktopAPI.get(DbAPI.instance(), {
							workspace: { id: workspaceId },
							desktop: { id: view.desktopId },
						});
					if (desktop) PresenceAPI.view(workspaceId, id, desktop.id);
				},
				onClose: () => PresenceAPI.leave(workspaceId, id),
			};
		}),
	)
	.patch("/", MiddlewareAPI.isOwner, zValidator("json", Workspace.Update), (c) => {
		const workspace = WorkspaceAPI.update(DbAPI.instance(), {
			workspace: c.get("workspace"),
			input: c.req.valid("json"),
		});
		SyncAPI.push({ workspace }, Workspace.Events.updated, { workspaceId: workspace.id });
		return c.json(workspace);
	})
	.delete("/", MiddlewareAPI.isOwner, async (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const users = WorkspaceAPI.members(db, workspace).map((member) => member.userId);
		await WorkspaceAPI.remove(db, workspace);
		SyncAPI.push({ users }, Workspace.Events.removed, { workspaceId: workspace.id });
		return c.json({ ok: true });
	})
	.post("/leave", (c) => {
		if (c.get("member").role === "owner") {
			return c.json({ message: "Owners cannot leave; delete the workspace instead" }, 400);
		}
		const workspace = c.get("workspace");
		const user = c.get("identity").user;
		WorkspaceAPI.leave(DbAPI.instance(), { workspace, user });
		SyncAPI.push({ workspace }, Workspace.Events.members, { workspaceId: workspace.id });
		SyncAPI.push({ users: [user.id] }, Workspace.Events.removed, { workspaceId: workspace.id });
		return c.json({ ok: true });
	})
	.route("/desktops", desktopApp)
	.get("/usage", async (c) => c.json(await SandboxAPI.usage(c.get("workspace").id)))
	.get("/members", (c) => c.json(WorkspaceAPI.members(DbAPI.instance(), c.get("workspace"))))
	.get("/invites", (c) => c.json(InviteAPI.list(DbAPI.instance(), c.get("workspace"))))
	.post("/invites", zValidator("json", Invite.Create), (c) => {
		const workspace = c.get("workspace");
		const invite = InviteAPI.create(DbAPI.instance(), {
			workspace,
			invitedBy: c.get("identity").user,
			input: c.req.valid("json"),
		});
		SyncAPI.push({ workspace }, Invite.Events.workspace, { workspaceId: workspace.id });
		SyncAPI.push({ emails: [invite.email] }, Invite.Events.inbox, {});
		return c.json(invite, 201);
	})
	.delete("/invites/:inviteId", (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const invite = InviteAPI.get(db, { id: c.req.param("inviteId") });
		if (!invite || invite.workspaceId !== workspace.id) {
			return c.json({ message: "Not found" }, 404);
		}
		InviteAPI.revoke(db, invite);
		SyncAPI.push({ workspace }, Invite.Events.workspace, { workspaceId: workspace.id });
		SyncAPI.push({ emails: [invite.email] }, Invite.Events.inbox, {});
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
		const workspace = c.get("workspace");
		const { path } = c.req.valid("query");
		await SandboxAPI.write(workspace.id, path, new Uint8Array(await c.req.arrayBuffer()));
		SyncAPI.push({ workspace }, Sandbox.Events.changed, { workspaceId: workspace.id, path });
		return c.json({ ok: true });
	})
	.delete("/files", zValidator("query", Path), (c) => {
		const workspace = c.get("workspace");
		const { path } = c.req.valid("query");
		SandboxAPI.unlink(workspace.id, path);
		SyncAPI.push({ workspace }, Sandbox.Events.changed, { workspaceId: workspace.id, path });
		return c.json({ ok: true });
	})
	.post("/mkdir", zValidator("json", Path), (c) => {
		const workspace = c.get("workspace");
		const { path } = c.req.valid("json");
		SandboxAPI.mkdir(workspace.id, path);
		SyncAPI.push({ workspace }, Sandbox.Events.changed, { workspaceId: workspace.id, path });
		return c.json({ ok: true });
	})
	.post("/run", zValidator("json", Sandbox.Run), async (c) => {
		const workspace = c.get("workspace");
		const input = c.req.valid("json");
		const result = await SandboxAPI.run(workspace.id, input);
		SyncAPI.push({ workspace }, Sandbox.Events.changed, {
			workspaceId: workspace.id,
			path: input.cwd,
		});
		return c.json(result);
	});

const app = new Hono<Middleware.IsAuthenticated>()
	.use(MiddlewareAPI.isAuthenticated)
	.get("/", (c) =>
		c.json(
			WorkspaceAPI.list(DbAPI.instance(), { user: c.get("identity").user }).map((workspace) => ({
				...workspace,
				online: PresenceAPI.online(workspace.id),
			})),
		),
	)
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
