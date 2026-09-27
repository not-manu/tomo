import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Sync } from "../../sync";
import { Presence } from "../presence";
import { workspaceWindowsTable } from "./table-sql";

export namespace DesktopWindow {
	export const Table = workspaceWindowsTable;

	export const Max = 12;

	export const App = z.enum(["terminal", "finder", "preview", "editor", "browser"]);
	export type App = z.infer<typeof App>;

	export const Frame = z.object({
		x: z.number().min(0).max(1),
		y: z.number().min(0).max(1),
		w: z.number().min(0.1).max(1),
		h: z.number().min(0.1).max(1),
	});
	export type Frame = z.infer<typeof Frame>;

	export const Select = createSelectSchema(Table, {
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
	});
	export type Select = z.infer<typeof Select>;

	export const Create = z.object({
		desktopId: z.string(),
		app: App,
		path: z.string().max(1024).optional(),
	});
	export type Create = z.infer<typeof Create>;

	export const Update = z.object({
		frame: Frame.optional(),
		maximized: z.boolean().optional(),
		focus: z.literal(true).optional(),
		path: z.string().max(1024).optional(),
	});
	export type Update = z.infer<typeof Update>;

	export function frame(window: Pick<Select, "x" | "y" | "w" | "h">): Frame {
		return { x: window.x, y: window.y, w: window.w, h: window.h };
	}

	export const QueryKeys = {
		all: (workspaceId: string) => ["workspace", workspaceId, "windows"] as const,
	};

	export const Events = {
		changed: Sync.event("window.changed", z.object({ workspaceId: z.string() })),
		drag: Sync.event("window.drag", z.object({ windowId: z.string(), frame: Frame })),
		dragged: Sync.event(
			"window.dragged",
			z.object({ windowId: z.string(), frame: Frame, user: Presence.User }),
		),
	};
}
