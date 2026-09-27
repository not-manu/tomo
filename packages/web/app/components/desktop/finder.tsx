import type { Sandbox } from "@tomo/api";
import { ChevronLeft, FilePlus } from "lucide-react";
import { useState } from "react";
import { basename, hasFiles, join, parent, useFiles, useUpload } from "~/hooks/use-files";
import { cn } from "~/lib/utils";
import { EntryMenu } from "./entry-menu";
import { FileIcon } from "./file-icon";

export function Finder({
	workspaceId,
	path,
	onOpen,
	onNavigate,
}: {
	workspaceId: string;
	path: string;
	onOpen: (entry: Sandbox.Entry) => void;
	onNavigate: (path: string) => void;
}) {
	const [selected, setSelected] = useState<string | null>(null);
	const [over, setOver] = useState(false);
	const { data: entries = [], isPending } = useFiles(workspaceId, path);
	const upload = useUpload(workspaceId);

	function go(next: string) {
		setSelected(null);
		onNavigate(next);
	}

	async function create() {
		const names = new Set(entries.map((entry) => entry.name));
		let name = "untitled.txt";
		for (let index = 2; names.has(name); index++) name = `untitled ${index}.txt`;
		await upload.mutateAsync({ dir: path, files: [new File([""], name)] });
		onOpen({ name, path: join(path, name), type: "file", size: 0, modifiedAt: new Date() });
	}

	function open(entry: Sandbox.Entry) {
		if (entry.type === "dir") return go(entry.path);
		onOpen(entry);
	}

	return (
		<section
			aria-label="Files"
			className={cn(
				"flex size-full flex-col bg-background text-foreground",
				over && "ring-2 ring-blue-500 ring-inset",
			)}
			onDragLeave={() => setOver(false)}
			onDragOver={(event) => {
				if (!hasFiles(event)) return;
				event.preventDefault();
				event.stopPropagation();
				setOver(true);
			}}
			onDrop={(event) => {
				if (!hasFiles(event)) return;
				event.preventDefault();
				event.stopPropagation();
				setOver(false);
				upload.mutate({ dir: path, files: [...event.dataTransfer.files] });
			}}
		>
			<div className="flex h-10 shrink-0 items-center gap-2 border-b px-2">
				<button
					aria-label="Back"
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
					disabled={path === "/"}
					onClick={() => go(parent(path))}
					type="button"
				>
					<ChevronLeft className="size-4" />
				</button>
				<span className="truncate font-medium text-sm">
					{path === "/" ? "Home" : basename(path)}
				</span>
				<button
					aria-label="New file"
					className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
					onClick={() => void create().catch(() => undefined)}
					type="button"
				>
					<FilePlus className="size-4" />
				</button>
			</div>
			<div className="grid min-h-0 grow auto-rows-min grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2 overflow-y-auto p-3">
				{entries.map((entry) => (
					<EntryMenu entry={entry} key={entry.path} onOpen={open} workspaceId={workspaceId}>
						<button
							className="group flex flex-col items-center gap-1.5 rounded-lg p-1.5 outline-none"
							onClick={(event) => {
								event.stopPropagation();
								setSelected(entry.path);
							}}
							onContextMenu={() => setSelected(entry.path)}
							onDoubleClick={() => open(entry)}
							type="button"
						>
							<FileIcon className="size-14" entry={entry} workspaceId={workspaceId} />
							<span
								className={cn(
									"line-clamp-2 max-w-full break-all rounded px-1 text-center text-xs",
									selected === entry.path && "bg-blue-500 text-white",
								)}
							>
								{entry.name}
							</span>
						</button>
					</EntryMenu>
				))}
				{!isPending && entries.length === 0 ? (
					<p className="col-span-full py-10 text-center text-muted-foreground text-sm">
						Drop files here
					</p>
				) : null}
			</div>
		</section>
	);
}
