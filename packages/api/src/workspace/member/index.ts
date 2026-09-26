import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { roles, workspaceMembersTable } from "./table-sql";

export namespace Member {
	export const Table = workspaceMembersTable;

	export const Roles = roles;
	export const Role = z.enum(Roles);
	export type Role = z.infer<typeof Role>;

	export const Select = createSelectSchema(Table, { joinedAt: z.coerce.date() });
	export type Select = z.infer<typeof Select>;
}
