import { Workspace } from "@tomo/api";
import { cn } from "~/lib/utils";

export function Image({
	wallpaper,
	className,
}: {
	wallpaper: Workspace.Wallpaper;
	className?: string;
}) {
	const painting = Workspace.Wallpapers[wallpaper];
	return (
		<img
			alt={painting.artist ? `${painting.title} by ${painting.artist}` : painting.title}
			className={cn("size-full object-cover", className)}
			draggable={false}
			src={Workspace.wallpaperSrc(wallpaper)}
		/>
	);
}
