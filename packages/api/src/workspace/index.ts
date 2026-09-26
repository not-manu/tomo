import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { workspacesTable } from "./table-sql";

export namespace Workspace {
	export const Table = workspacesTable;

	export const Select = createSelectSchema(Table, {
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
	});
	export type Select = z.infer<typeof Select>;

	export const Create = z.object({
		name: z.string().trim().min(1, "Please name your workspace.").max(100),
	});
	export type Create = z.infer<typeof Create>;

	export const Update = Create.partial();
	export type Update = z.infer<typeof Update>;

	export function path(workspace: Pick<Select, "id">) {
		return `/w/${workspace.id}`;
	}
}
