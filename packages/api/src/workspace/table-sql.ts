import { Db } from "../api/db";
import { User } from "../auth/user";

export const workspacesTable = Db.Table(
	"workspace",
	{
		id: Db.Text("id").primaryKey().$defaultFn(Db.Id),
		name: Db.Text("name").notNull(),
		ownerId: Db.Text("owner_id")
			.notNull()
			.references(() => User.Table.id, { onDelete: "cascade" }),
		createdAt: Db.Timestamp("created_at").notNull().$defaultFn(Db.Now),
		updatedAt: Db.Timestamp("updated_at").notNull().$defaultFn(Db.Now).$onUpdate(Db.Now),
	},
	(t) => [Db.Index("workspace_owner_id_idx").on(t.ownerId)],
);
