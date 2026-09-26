import type { Member, Workspace } from "@tomo/api";
import { toast } from "sonner";
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
import { useDeleteWorkspace, useLeaveWorkspace } from "~/hooks/use-workspace";

export type Target = Pick<Workspace.Select, "id" | "name"> & { role: Member.Role };

export function Root({
	workspace,
	open,
	onOpenChange,
	onSuccess,
}: {
	workspace: Target;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}) {
	const remove = useDeleteWorkspace(workspace.id);
	const leave = useLeaveWorkspace(workspace.id);
	const owner = workspace.role === "owner";
	const action = owner ? remove : leave;

	async function confirm() {
		try {
			await action.mutateAsync();
			toast.success(owner ? "Workspace deleted" : `Left ${workspace.name}`);
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{owner ? "Delete this workspace?" : "Leave this workspace?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{owner
							? `This deletes ${workspace.name}, its files and its sandbox for everyone. There is no undo.`
							: `You'll lose access to ${workspace.name} until someone invites you again.`}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={action.isPending} onClick={confirm} variant="destructive">
						{owner ? "Delete" : "Leave"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
