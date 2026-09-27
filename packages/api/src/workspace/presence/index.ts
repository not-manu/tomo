import { z } from "zod";
import { Sync } from "../../sync";

export namespace Presence {
	export const Point = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });
	export type Point = z.infer<typeof Point>;

	export const User = z.object({ id: z.string(), name: z.string(), image: z.string().nullish() });
	export type User = z.infer<typeof User>;

	export const Cursor = z.object({ id: z.string(), user: User, point: Point.nullable() });
	export type Cursor = z.infer<typeof Cursor>;

	export const Viewers = z.record(z.string(), z.array(User));
	export type Viewers = z.infer<typeof Viewers>;

	export const Events = {
		move: Sync.event("presence.move", z.object({ point: Point.nullable() })),
		view: Sync.event("presence.view", z.object({ desktopId: z.string() })),
		cursor: Sync.event("presence.cursor", Cursor),
		leave: Sync.event("presence.leave", z.object({ id: z.string() })),
		viewers: Sync.event("presence.viewers", z.object({ desktops: Viewers })),
		online: Sync.event("presence.online", z.object({ workspaceId: z.string() })),
	};
}
