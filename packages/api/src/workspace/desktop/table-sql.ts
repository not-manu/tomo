import { Db } from "../../api/db";
import { User } from "../../auth/user";
import { Workspace } from "..";

export const workspaceDesktopsTable = Db.Table(
	"workspace_desktop",
	{
		id: Db.Text("id").primaryKey().$defaultFn(Db.Id),
		workspaceId: Db.Text("workspace_id")
			.notNull()
			.references(() => Workspace.Table.id, { onDelete: "cascade" }),
		name: Db.Text("name").notNull(),
		position: Db.Int("position").notNull(),
		createdBy: Db.Text("created_by").references(() => User.Table.id, { onDelete: "set null" }),
		createdAt: Db.Timestamp("created_at").notNull().$defaultFn(Db.Now),
		updatedAt: Db.Timestamp("updated_at").notNull().$defaultFn(Db.Now).$onUpdate(Db.Now),
	},
	(t) => [Db.Index("workspace_desktop_workspace_id_idx").on(t.workspaceId, t.position)],
);
