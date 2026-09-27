import type { Desktop as DesktopModel, Presence } from "@tomo/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateDesktop, useRemoveDesktop, useRenameDesktop } from "~/hooks/use-desktops";
import { Tab } from "./tab";

type Item = Pick<DesktopModel.Select, "id" | "name">;

function report(error: unknown) {
	toast.error(error instanceof Error ? error.message : "Something went wrong.");
}

export function Tabs({
	workspaceId,
	desktops,
	active,
	viewers,
	onSelect,
}: {
	workspaceId: string;
	desktops: Item[];
	active: string | undefined;
	viewers: Presence.Viewers;
	onSelect: (id: string) => void;
}) {
	const create = useCreateDesktop(workspaceId);
	const rename = useRenameDesktop(workspaceId);
	const remove = useRemoveDesktop(workspaceId);

	return (
		<div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
			{desktops.map((desktop) => (
				<Tab
					active={desktop.id === active}
					key={desktop.id}
					name={desktop.name}
					onRemove={() => remove.mutateAsync(desktop.id).catch(report)}
					onRename={(name) => rename.mutateAsync({ desktopId: desktop.id, name }).catch(report)}
					onSelect={() => onSelect(desktop.id)}
					removable={desktops.length > 1}
					viewers={viewers[desktop.id] ?? []}
				/>
			))}
			<button
				aria-label="New desktop"
				className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
				disabled={create.isPending}
				onClick={() =>
					create
						.mutateAsync({})
						.then((desktop) => onSelect(desktop.id))
						.catch(report)
				}
				type="button"
			>
				<Plus className="size-4" />
			</button>
		</div>
	);
}
