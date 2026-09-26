import { Db } from "../api/db";
import { User } from "../auth/user";

export const wallpapers = {
	"starry-night": { title: "The Starry Night", artist: "Vincent van Gogh", year: 1889 },
	"great-wave": { title: "The Great Wave off Kanagawa", artist: "Hokusai", year: 1831 },
	"water-lilies": { title: "Water Lilies", artist: "Claude Monet", year: 1906 },
	wanderer: {
		title: "Wanderer above the Sea of Fog",
		artist: "Caspar David Friedrich",
		year: 1818,
	},
	"almond-blossom": { title: "Almond Blossom", artist: "Vincent van Gogh", year: 1890 },
	"impression-sunrise": { title: "Impression, Sunrise", artist: "Claude Monet", year: 1872 },
	"the-kiss": { title: "The Kiss", artist: "Gustav Klimt", year: 1908 },
	"grande-jatte": { title: "A Sunday on La Grande Jatte", artist: "Georges Seurat", year: 1884 },
} as const;

export type WallpaperKey = keyof typeof wallpapers;
export const wallpaperKeys = Object.keys(wallpapers) as [WallpaperKey, ...WallpaperKey[]];

export const workspacesTable = Db.Table(
	"workspace",
	{
		id: Db.Text("id").primaryKey().$defaultFn(Db.Id),
		name: Db.Text("name").notNull(),
		wallpaper: Db.Text("wallpaper", { enum: wallpaperKeys }).notNull().default("starry-night"),
		ownerId: Db.Text("owner_id")
			.notNull()
			.references(() => User.Table.id, { onDelete: "cascade" }),
		createdAt: Db.Timestamp("created_at").notNull().$defaultFn(Db.Now),
		updatedAt: Db.Timestamp("updated_at").notNull().$defaultFn(Db.Now).$onUpdate(Db.Now),
	},
	(t) => [Db.Index("workspace_owner_id_idx").on(t.ownerId)],
);
