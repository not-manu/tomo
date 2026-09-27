import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { DbAPI } from "../../api/db/api";
import type { Middleware } from "../../api/middleware";
import { SyncAPI } from "../../sync/api";
import { DesktopAPI } from "../desktop/api";
import { TerminalAPI } from "../terminal/api";
import { DesktopWindow } from ".";
import { WindowAPI } from "./api";

function changed(workspace: { id: string }) {
	SyncAPI.push({ workspace }, DesktopWindow.Events.changed, { workspaceId: workspace.id });
}

const app = new Hono<Middleware.IsMember>()
	.get("/", (c) => c.json(WindowAPI.list(DbAPI.instance(), c.get("workspace"))))
	.post("/", zValidator("json", DesktopWindow.Create), (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const input = c.req.valid("json");
		const desktop = DesktopAPI.get(db, { workspace, desktop: { id: input.desktopId } });
		if (!desktop) return c.json({ message: "Not found" }, 404);
		const window = WindowAPI.create(db, {
			workspace,
			desktop,
			user: c.get("identity").user,
			app: input.app,
			path: input.path,
		});
		changed(workspace);
		return c.json(window, 201);
	})
	.patch("/:windowId", zValidator("json", DesktopWindow.Update), (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const window = WindowAPI.get(db, { workspace, window: { id: c.req.param("windowId") } });
		if (!window) return c.json({ message: "Not found" }, 404);
		const updated = WindowAPI.update(db, { window, input: c.req.valid("json") });
		changed(workspace);
		return c.json(updated);
	})
	.delete("/:windowId", async (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const window = WindowAPI.get(db, { workspace, window: { id: c.req.param("windowId") } });
		if (!window) return c.json({ message: "Not found" }, 404);
		WindowAPI.remove(db, window);
		changed(workspace);
		await TerminalAPI.close(workspace.id, window.id);
		return c.json({ ok: true });
	});

export default app;
