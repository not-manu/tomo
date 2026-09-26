import { Db } from "../../api/db";
import { User } from "../../auth/user";
import { Workspace } from "..";
import { roles } from "../member/table-sql";

export const statuses = ["pending", "accepted", "declined"] as const;

export const workspaceInvitesTable = Db.Table(
	"workspace_invite",
	{
		id: Db.Text("id").primaryKey().$defaultFn(Db.Id),
		workspaceId: Db.Text("workspace_id")
			.notNull()
			.references(() => Workspace.Table.id, { onDelete: "cascade" }),
		email: Db.Text("email").notNull(),
		role: Db.Text("role", { enum: roles }).notNull().default("member"),
		status: Db.Text("status", { enum: statuses }).notNull().default("pending"),
		invitedBy: Db.Text("invited_by")
			.notNull()
			.references(() => User.Table.id, { onDelete: "cascade" }),
		createdAt: Db.Timestamp("created_at").notNull().$defaultFn(Db.Now),
		updatedAt: Db.Timestamp("updated_at").notNull().$defaultFn(Db.Now).$onUpdate(Db.Now),
	},
	(t) => [
		Db.UniqueIndex("workspace_invite_workspace_email_idx").on(t.workspaceId, t.email),
		Db.Index("workspace_invite_email_idx").on(t.email),
	],
);
