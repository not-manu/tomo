import { createMiddleware } from "hono/factory";
import { WorkspaceAPI } from "../../workspace/api";
import { DbAPI } from "../db/api";
import type { Middleware } from "./index";

export const isMember = createMiddleware<Middleware.IsMember>(async (c, next) => {
	const db = DbAPI.instance();
	const id = c.req.param("id");
	const workspace = id ? WorkspaceAPI.get(db, { id }) : undefined;
	if (!workspace) return c.json({ message: "Not found" }, 404);

	const member = WorkspaceAPI.member(db, { workspace, user: c.get("identity").user });
	if (!member) return c.json({ message: "Forbidden" }, 403);

	c.set("workspace", workspace);
	c.set("member", member);
	await next();
});

export const isOwner = createMiddleware<Middleware.IsMember>(async (c, next) => {
	if (c.get("member").role !== "owner") return c.json({ message: "Forbidden" }, 403);
	await next();
});
