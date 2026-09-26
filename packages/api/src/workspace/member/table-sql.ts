import { Db } from "../../api/db";
import { User } from "../../auth/user";
import { Workspace } from "..";

export const roles = ["owner", "member"] as const;

export const workspaceMembersTable = Db.Table(
	"workspace_member",
	{
		workspaceId: Db.Text("workspace_id")
			.notNull()
			.references(() => Workspace.Table.id, { onDelete: "cascade" }),
		userId: Db.Text("user_id")
			.notNull()
			.references(() => User.Table.id, { onDelete: "cascade" }),
		role: Db.Text("role", { enum: roles }).notNull().default("member"),
		joinedAt: Db.Timestamp("joined_at").notNull().$defaultFn(Db.Now),
	},
	(t) => [
		Db.PrimaryKey({ columns: [t.workspaceId, t.userId] }),
		Db.Index("workspace_member_user_id_idx").on(t.userId),
	],
);
