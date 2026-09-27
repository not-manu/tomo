import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { DbAPI } from "../../api/db/api";
import type { Middleware } from "../../api/middleware";
import { SyncAPI } from "../../sync/api";
import { PresenceAPI } from "../presence/api";
import { TerminalAPI } from "../terminal/api";
import { DesktopWindow } from "../window";
import { WindowAPI } from "../window/api";
import { Desktop } from ".";
import { DesktopAPI } from "./api";

function changed(workspace: { id: string }) {
	SyncAPI.push({ workspace }, Desktop.Events.changed, { workspaceId: workspace.id });
}

const app = new Hono<Middleware.IsMember>()
	.get("/", (c) => c.json(DesktopAPI.list(DbAPI.instance(), c.get("workspace"))))
	.post("/", zValidator("json", Desktop.Create), (c) => {
		const workspace = c.get("workspace");
		const desktop = DesktopAPI.create(DbAPI.instance(), {
			workspace,
			user: c.get("identity").user,
			input: c.req.valid("json"),
		});
		changed(workspace);
		return c.json(desktop, 201);
	})
	.put("/order", zValidator("json", Desktop.Order), (c) => {
		const workspace = c.get("workspace");
		const desktops = DesktopAPI.reorder(DbAPI.instance(), {
			workspace,
			input: c.req.valid("json"),
		});
		changed(workspace);
		return c.json(desktops);
	})
	.patch("/:desktopId", zValidator("json", Desktop.Update), (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const desktop = DesktopAPI.get(db, { workspace, desktop: { id: c.req.param("desktopId") } });
		if (!desktop) return c.json({ message: "Not found" }, 404);
		const updated = DesktopAPI.rename(db, { desktop, input: c.req.valid("json") });
		changed(workspace);
		return c.json(updated);
	})
	.delete("/:desktopId", async (c) => {
		const db = DbAPI.instance();
		const workspace = c.get("workspace");
		const desktop = DesktopAPI.get(db, { workspace, desktop: { id: c.req.param("desktopId") } });
		if (!desktop) return c.json({ message: "Not found" }, 404);
		const windows = WindowAPI.onDesktop(db, desktop);
		DesktopAPI.remove(db, { workspace, desktop });
		PresenceAPI.evict(workspace.id, desktop.id);
		changed(workspace);
		SyncAPI.push({ workspace }, DesktopWindow.Events.changed, { workspaceId: workspace.id });
		await Promise.all(windows.map((window) => TerminalAPI.close(workspace.id, window.id)));
		return c.json({ ok: true });
	});

export default app;
