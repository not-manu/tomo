import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Member } from "../member";
import { statuses, workspaceInvitesTable } from "./table-sql";

export namespace Invite {
	export const Table = workspaceInvitesTable;

	export const Statuses = statuses;
	export const Status = z.enum(Statuses);
	export type Status = z.infer<typeof Status>;

	export const Select = createSelectSchema(Table, {
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
	});
	export type Select = z.infer<typeof Select>;

	export const Create = z.object({
		email: z.email("Please enter a valid email."),
		role: Member.Role.default("member"),
	});
	export type Create = z.infer<typeof Create>;

	export function normalizeEmail(email: string) {
		return email.trim().toLowerCase();
	}

	export const QueryKeys = {
		inbox: () => ["invites"] as const,
		workspace: (id: string) => ["workspace", id, "invites"] as const,
	};
}
