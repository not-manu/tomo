import { Workspace } from "@tomo/api";
import { cn } from "~/lib/utils";

export function Image({
	wallpaper,
	className,
}: {
	wallpaper: Workspace.Wallpaper;
	className?: string;
}) {
	const key = wallpaper in Workspace.Wallpapers ? wallpaper : Workspace.DefaultWallpaper;
	const photo = Workspace.Wallpapers[key];
	return (
		<img
			alt={`${photo.title} by ${photo.artist}`}
			className={cn("size-full object-cover", className)}
			draggable={false}
			src={Workspace.wallpaperSrc(key)}
		/>
	);
}
