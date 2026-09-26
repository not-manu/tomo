import { sql } from "drizzle-orm";
import { Db } from "../api/db";
import { User } from "../auth/user";

const LiYe = { artist: "Li Ye", year: 2019 } as const;

export const wallpapers = {
	"rolling-hills": { title: "Rolling Hills", ...LiYe },
	"pine-pasture": { title: "Pine Pasture", ...LiYe },
	cloudbreak: { title: "Cloudbreak", ...LiYe },
	poppies: { title: "Poppies", ...LiYe },
	horses: { title: "Horses", ...LiYe },
	snowline: { title: "Snowline", ...LiYe },
	"tall-grass": { title: "Tall Grass", ...LiYe },
	hillside: { title: "Hillside", ...LiYe },
	haze: { title: "Haze", ...LiYe },
	"first-light": { title: "First Light", ...LiYe },
} as const;

export type WallpaperKey = keyof typeof wallpapers;
export const wallpaperKeys = Object.keys(wallpapers) as [WallpaperKey, ...WallpaperKey[]];
export const defaultWallpaper: WallpaperKey = "rolling-hills";

export const workspacesTable = Db.Table(
	"workspace",
	{
		id: Db.Text("id").primaryKey().$defaultFn(Db.Id),
		name: Db.Text("name").notNull(),
		wallpaper: Db.Text("wallpaper", { enum: wallpaperKeys })
			.notNull()
			// TODO: drop this legacy SQL default once a table rebuild can run with foreign keys off
			.default(sql`'starry-night'`),
		ownerId: Db.Text("owner_id")
			.notNull()
			.references(() => User.Table.id, { onDelete: "cascade" }),
		createdAt: Db.Timestamp("created_at").notNull().$defaultFn(Db.Now),
		updatedAt: Db.Timestamp("updated_at").notNull().$defaultFn(Db.Now).$onUpdate(Db.Now),
	},
	(t) => [Db.Index("workspace_owner_id_idx").on(t.ownerId)],
);
