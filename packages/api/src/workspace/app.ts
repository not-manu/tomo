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
import { Document } from "./document";
import { DocumentAPI } from "./document/api";
import { Invite } from "./invite";
import { InviteAPI } from "./invite/api";
import { Presence } from "./presence";
import { PresenceAPI } from "./presence/api";
import { Terminal } from "./terminal";
import { TerminalAPI } from "./terminal/api";
import { DesktopWindow } from "./window";
import { WindowAPI } from "./window/api";
import windowApp from "./window/app";

const Path = z.object({ path: z.string().default("/") });

const one = new Hono<Middleware.IsMember>()
	.use(MiddlewareAPI.isMember)
	.onError((error, c) => {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === "ENOENT" || code === "ENOTDIR") return c.json({ message: "Not found" }, 404);
		if (error.message === "Path escapes workspace") return c.json({ message: error.message }, 400);
		if (error.message === "Already a member") return c.json({ message: error.message }, 409);
		if (error.message === "Storage limit reached") return c.json({ message: error.message }, 413);
		if (error.message === "Desktop limit reached" || error.message === "Window limit reached") {
			return c.json({ message: error.message }, 409);
		}
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
			const user = { id: userId, name, image };
			const id = Core.Id();
			return {
				onOpen: (_, ws) => {
					PresenceAPI.join(workspaceId, {
						ws,
						cursor: { id, user, point: null },
					});
					SocketAPI.keepAlive(ws);
				},
				onMessage: (event, ws) => {
					const message = Sync.parse(event.data);
					if (!message) return;
					const workspace = { id: workspaceId };
					const move = Sync.decode(Presence.Events.move, message);
					if (move) return PresenceAPI.move(workspaceId, id, move.point);
					const drag = Sync.decode(DesktopWindow.Events.drag, message);
					if (drag) {
						return PresenceAPI.relay(workspaceId, id, (user) =>
							Sync.encode(DesktopWindow.Events.dragged, { ...drag, user }),
						);
					}
					const docUpdate = Sync.decode(Document.Events.update, message);
					if (docUpdate) {
						return DocumentAPI.update(workspaceId, docUpdate.path, ws, docUpdate.update);
					}
					const docAwareness = Sync.decode(Document.Events.awareness, message);
					if (docAwareness) {
						return DocumentAPI.awareness(workspaceId, docAwareness.path, ws, docAwareness.update);
					}
					const docOpen = Sync.decode(Document.Events.open, message);
					if (docOpen) return DocumentAPI.open(workspaceId, docOpen.path, ws);
					const docClose = Sync.decode(Document.Events.close, message);
					if (docClose) return DocumentAPI.close(workspaceId, docClose.path, ws);
					const input = Sync.decode(Terminal.Events.input, message);
					if (input) return void TerminalAPI.input(input.windowId, ws, input.data);
					const resize = Sync.decode(Terminal.Events.resize, message);
					if (resize) return TerminalAPI.resize(resize.windowId, ws, resize.size);
					const detach = Sync.decode(Terminal.Events.detach, message);
					if (detach) return TerminalAPI.detach(detach.windowId, ws);
					const attach = Sync.decode(Terminal.Events.attach, message);
					if (attach) {
						const window = WindowAPI.get(DbAPI.instance(), {
							workspace,
							window: { id: attach.windowId },
						});
						if (window?.app !== "terminal") return;
						return void TerminalAPI.attach({ ...attach, workspaceId, ws }).catch((error) =>
							console.error(`terminal ${attach.windowId} failed`, error),
						);
					}
					const view = Sync.decode(Presence.Events.view, message);
					const desktop =
						view &&
						DesktopAPI.get(DbAPI.instance(), { workspace, desktop: { id: view.desktopId } });
					if (desktop) PresenceAPI.view(workspaceId, id, desktop.id);
				},
				onClose: (_, ws) => {
					TerminalAPI.detachAll(ws);
					DocumentAPI.closeAll(workspaceId, ws);
					PresenceAPI.leave(workspaceId, id);
				},
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
	.route("/windows", windowApp)
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
	.get("/files/content", zValidator("query", Path), (c) => {
		const id = c.get("workspace").id;
		const { path } = c.req.valid("query");
		const total = SandboxAPI.size(id, path);
		const headers = {
			"Content-Type": Sandbox.mime(path),
			...(Sandbox.preview(path) === "pdf" ? {} : { "Content-Security-Policy": "sandbox" }),
			"X-Content-Type-Options": "nosniff",
			"Accept-Ranges": "bytes",
		};
		const range = /^bytes=(\d*)-(\d*)$/.exec(c.req.header("Range") ?? "");
		if (!range || total === 0) {
			return c.body(SandboxAPI.stream(id, path), 200, {
				...headers,
				"Content-Length": String(total),
			});
		}
		const suffix = !range[1];
		const start = suffix ? Math.max(0, total - Number(range[2])) : Number(range[1]);
		const end = suffix || !range[2] ? total - 1 : Math.min(Number(range[2]), total - 1);
		if (start > end || start >= total) {
			return c.body(null, 416, { ...headers, "Content-Range": `bytes */${total}` });
		}
		return c.body(SandboxAPI.stream(id, path, { start, end }), 206, {
			...headers,
			"Content-Length": String(end - start + 1),
			"Content-Range": `bytes ${start}-${end}/${total}`,
		});
	})
	.put("/files", zValidator("query", Path), async (c) => {
		const workspace = c.get("workspace");
		const { path } = c.req.valid("query");
		const body = c.req.raw.body;
		const bytes = Number(c.req.header("Content-Length") ?? 0);
		if (body) await SandboxAPI.upload(workspace.id, path, body, bytes);
		else await SandboxAPI.write(workspace.id, path, new Uint8Array());
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
