import { Sandbox } from "@tomo/api";
import { fileUrl } from "~/hooks/use-files";
import { cn } from "~/lib/utils";

export function FileIcon({
	workspaceId,
	entry,
	className,
}: {
	workspaceId: string;
	entry: Sandbox.Entry;
	className?: string;
}) {
	const kind = entry.type === "file" ? Sandbox.preview(entry.path) : undefined;
	const src = fileUrl(workspaceId, entry.path, entry.modifiedAt);
	const frame = "size-full rounded-md object-cover shadow-sm ring-1 ring-black/10";

	return (
		<div className={cn("flex items-center justify-center", className)}>
			{kind === "image" ? (
				<img alt="" className={frame} draggable={false} loading="lazy" src={src} />
			) : kind === "video" ? (
				<video className={frame} muted preload="metadata" src={src} />
			) : (
				<img
					alt=""
					className="size-full object-contain"
					draggable={false}
					src={entry.type === "dir" ? "/apps/folder.png" : "/apps/document.png"}
				/>
			)}
		</div>
	);
}
