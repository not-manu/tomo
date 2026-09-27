import type { Sandbox } from "@tomo/api";
import { ExternalLink, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useDeleteFile } from "~/hooks/use-files";

export function EntryMenu({
	workspaceId,
	entry,
	onOpen,
	children,
}: {
	workspaceId: string;
	entry: Sandbox.Entry;
	onOpen: (entry: Sandbox.Entry) => void;
	children: ReactNode;
}) {
	const [confirm, setConfirm] = useState(false);
	const remove = useDeleteFile(workspaceId);
	const folder = entry.type === "dir";

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onSelect={() => onOpen(entry)}>
						<ExternalLink />
						Open
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onSelect={() => setConfirm(true)} variant="destructive">
						<Trash2 />
						Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<AlertDialog onOpenChange={setConfirm} open={confirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete “{entry.name}”?</AlertDialogTitle>
						<AlertDialogDescription>
							{folder
								? "This folder and everything in it will be deleted for everyone in the workspace."
								: "This file will be deleted for everyone in the workspace."}{" "}
							This can't be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => remove.mutate(entry.path)} variant="destructive">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
