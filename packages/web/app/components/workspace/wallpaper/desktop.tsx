import type { Workspace } from "@tomo/api";
import { cn } from "~/lib/utils";
import { Image } from "./image";

export function Desktop({
	workspace,
	className,
}: {
	workspace: Pick<Workspace.Select, "wallpaper">;
	className?: string;
}) {
	return (
		<span className={cn("relative block overflow-hidden bg-muted", className)}>
			<Image className="absolute inset-0" wallpaper={workspace.wallpaper} />
			<span className="absolute inset-x-0 bottom-2 mx-auto flex h-6 w-fit items-center gap-1 rounded-lg bg-white/50 px-1.5 backdrop-blur-md dark:bg-black/40">
				{["a", "b", "c", "d"].map((key) => (
					<span key={key} className="size-3.5 rounded-sm bg-white/90 dark:bg-white/70" />
				))}
			</span>
		</span>
	);
}
