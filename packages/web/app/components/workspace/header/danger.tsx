import { LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
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
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useDeleteWorkspace, useLeaveWorkspace } from "~/hooks/use-workspace";
import type { Detail } from "./root";

export function Danger({ workspace }: { workspace: Detail }) {
	const navigate = useNavigate();
	const remove = useDeleteWorkspace(workspace.id);
	const leave = useLeaveWorkspace(workspace.id);
	const owner = workspace.role === "owner";
	const action = owner ? remove : leave;

	async function confirm() {
		try {
			await action.mutateAsync();
			toast.success(owner ? "Workspace deleted" : `Left ${workspace.name}`);
			navigate("/app", { replace: true });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					aria-label={owner ? "Delete workspace" : "Leave workspace"}
					size="icon"
					variant="destructive"
				>
					{owner ? <Trash2 /> : <LogOut />}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{owner ? "Delete this workspace?" : "Leave this workspace?"}</AlertDialogTitle>
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
