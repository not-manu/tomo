import { z } from "zod";
import { Sync } from "../../sync";

export namespace Presence {
	export const Point = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });
	export type Point = z.infer<typeof Point>;

	export const Cursor = z.object({
		id: z.string(),
		user: z.object({ id: z.string(), name: z.string(), image: z.string().nullish() }),
		point: Point.nullable(),
	});
	export type Cursor = z.infer<typeof Cursor>;

	export const Events = {
		move: Sync.event("presence.move", z.object({ point: Point.nullable() })),
		cursor: Sync.event("presence.cursor", Cursor),
		leave: Sync.event("presence.leave", z.object({ id: z.string() })),
	};
}
