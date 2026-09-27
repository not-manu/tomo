import type { Workspace } from "@tomo/api";
import { snapshotUrl } from "~/hooks/use-snapshot";
import { cn } from "~/lib/utils";
import { Image } from "./image";

export function Desktop({
	workspace,
	className,
	imageClassName,
}: {
	workspace: Pick<Workspace.Select, "id" | "wallpaper"> & { snapshotAt?: number | null };
	className?: string;
	imageClassName?: string;
}) {
	return (
		<span className={cn("relative block overflow-hidden bg-muted", className)}>
			{workspace.snapshotAt ? (
				<img
					alt=""
					className={cn("absolute inset-0 size-full object-cover", imageClassName)}
					draggable={false}
					src={snapshotUrl(workspace.id, workspace.snapshotAt)}
				/>
			) : (
				<>
					<Image
						className={cn("absolute inset-0", imageClassName)}
						wallpaper={workspace.wallpaper}
					/>
					<span className="absolute inset-x-0 bottom-2 mx-auto flex h-6 w-fit items-center gap-1 rounded-lg bg-white/50 px-1.5 backdrop-blur-md dark:bg-black/40">
						{["a", "b", "c", "d"].map((key) => (
							<span key={key} className="size-3.5 rounded-sm bg-white/90 dark:bg-white/70" />
						))}
					</span>
				</>
			)}
		</span>
	);
}
