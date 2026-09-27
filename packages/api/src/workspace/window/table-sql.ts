import { Db } from "../../api/db";
import { User } from "../../auth/user";
import { Workspace } from "..";
import { Desktop } from "../desktop";

export const workspaceWindowsTable = Db.Table(
	"workspace_window",
	{
		id: Db.Text("id").primaryKey().$defaultFn(Db.Id),
		workspaceId: Db.Text("workspace_id")
			.notNull()
			.references(() => Workspace.Table.id, { onDelete: "cascade" }),
		desktopId: Db.Text("desktop_id")
			.notNull()
			.references(() => Desktop.Table.id, { onDelete: "cascade" }),
		app: Db.Text("app", { enum: ["terminal", "finder", "preview", "editor"] }).notNull(),
		path: Db.Text("path"),
		x: Db.Real("x").notNull(),
		y: Db.Real("y").notNull(),
		w: Db.Real("w").notNull(),
		h: Db.Real("h").notNull(),
		z: Db.Int("z").notNull(),
		maximized: Db.Bool("maximized").notNull().default(false),
		createdBy: Db.Text("created_by").references(() => User.Table.id, { onDelete: "set null" }),
		createdAt: Db.Timestamp("created_at").notNull().$defaultFn(Db.Now),
		updatedAt: Db.Timestamp("updated_at").notNull().$defaultFn(Db.Now).$onUpdate(Db.Now),
	},
	(t) => [Db.Index("workspace_window_desktop_id_idx").on(t.desktopId)],
);
