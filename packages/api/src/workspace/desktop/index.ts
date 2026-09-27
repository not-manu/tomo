import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Sync } from "../../sync";
import { workspaceDesktopsTable } from "./table-sql";

export namespace Desktop {
	export const Table = workspaceDesktopsTable;

	export const Select = createSelectSchema(Table, {
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
	});
	export type Select = z.infer<typeof Select>;

	const Name = z.string().trim().min(1, "Please name this desktop.").max(40);

	export const Create = z.object({ name: Name.optional() });
	export type Create = z.infer<typeof Create>;

	export const Update = z.object({ name: Name });
	export type Update = z.infer<typeof Update>;

	export const Order = z.object({ ids: z.array(z.string()).min(1) });
	export type Order = z.infer<typeof Order>;

	export function defaultName(index: number) {
		return `Desktop ${index + 1}`;
	}

	export const QueryKeys = {
		all: (workspaceId: string) => ["workspace", workspaceId, "desktops"] as const,
	};

	export const Events = {
		changed: Sync.event("desktop.changed", z.object({ workspaceId: z.string() })),
	};
}
