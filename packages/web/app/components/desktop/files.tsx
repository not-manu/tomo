import type { Sandbox } from "@tomo/api";
import { useState } from "react";
import { useFiles } from "~/hooks/use-files";
import { cn } from "~/lib/utils";
import { EntryMenu } from "./entry-menu";
import { FileIcon } from "./file-icon";

export const DesktopFolder = "/Desktop";

export function Files({
	workspaceId,
	onOpen,
}: {
	workspaceId: string;
	onOpen: (entry: Sandbox.Entry) => void;
}) {
	const { data: entries = [] } = useFiles(workspaceId, DesktopFolder);
	const [selected, setSelected] = useState<string | null>(null);

	return (
		<div className="pointer-events-none flex size-full flex-col flex-wrap-reverse content-start items-end gap-1 p-4">
			{entries.map((entry) => (
				<EntryMenu entry={entry} key={entry.path} onOpen={onOpen} workspaceId={workspaceId}>
					<button
						className="pointer-events-auto flex w-24 flex-col items-center gap-1 rounded-lg p-1.5 outline-none"
						onBlur={() => setSelected(null)}
						onClick={() => setSelected(entry.path)}
						onContextMenu={() => setSelected(entry.path)}
						onDoubleClick={() => onOpen(entry)}
						type="button"
					>
						<FileIcon
							className={cn(
								"size-16 rounded-lg p-0.5",
								selected === entry.path && "bg-black/25 ring-1 ring-white/30",
							)}
							entry={entry}
							workspaceId={workspaceId}
						/>
						<span
							className={cn(
								"line-clamp-2 max-w-full break-all rounded px-1 text-center font-medium text-white text-xs [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]",
								selected === entry.path && "bg-blue-500 [text-shadow:none]",
							)}
						>
							{entry.name}
						</span>
					</button>
				</EntryMenu>
			))}
		</div>
	);
}
