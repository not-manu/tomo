import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Sync } from "../sync";
import { defaultWallpaper, wallpaperKeys, wallpapers, workspacesTable } from "./table-sql";

export namespace Workspace {
	export const Table = workspacesTable;

	export const Wallpapers = wallpapers;
	export const DefaultWallpaper = defaultWallpaper;
	export const Wallpaper = z.enum(wallpaperKeys);
	export type Wallpaper = z.infer<typeof Wallpaper>;

	export const Select = createSelectSchema(Table, {
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
	});
	export type Select = z.infer<typeof Select>;

	export const Create = z.object({
		name: z.string().trim().min(1, "Please name your workspace.").max(100),
	});
	export type Create = z.infer<typeof Create>;

	export const Update = Create.extend({ wallpaper: Wallpaper }).partial();
	export type Update = z.infer<typeof Update>;

	export function path(workspace: Pick<Select, "id">) {
		return `/w/${workspace.id}`;
	}

	export function desktopPath(workspace: Pick<Select, "id">) {
		return `${path(workspace)}/desktop`;
	}

	export function wallpaperSrc(wallpaper: Wallpaper) {
		return `/wallpapers/${wallpaper}.webp`;
	}

	export const QueryKeys = {
		all: () => ["workspaces"] as const,
		one: (id: string) => ["workspace", id] as const,
		members: (id: string) => ["workspace", id, "members"] as const,
	};

	const Ref = z.object({ workspaceId: z.string() });

	export const Events = {
		updated: Sync.event("workspace.updated", Ref),
		removed: Sync.event("workspace.removed", Ref),
		members: Sync.event("workspace.members", Ref),
	};
}
