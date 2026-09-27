import { Users } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkspaceInvites } from "~/hooks/use-invites";
import { useMembers } from "~/hooks/use-workspace";
import type { Detail } from "../header/root";
import { InviteForm } from "./invite-form";
import { Item } from "./item";
import { Pending } from "./pending";
import { People } from "./people";

export function Root({
	workspace,
	open,
	onOpenChange,
	children,
}: {
	workspace: Detail;
	open?: boolean | undefined;
	onOpenChange?: ((open: boolean) => void) | undefined;
	children?: ReactNode;
}) {
	const members = useMembers(workspace.id);
	const invites = useWorkspaceInvites(workspace.id);
	const [local, setLocal] = useState(false);

	return (
		<Dialog onOpenChange={onOpenChange ?? setLocal} open={open ?? local}>
			<DialogTrigger asChild>
				{children ?? (
					<Button variant="outline">
						<Users data-icon="inline-start" />
						Members
						{members.data ? (
							<span className="text-muted-foreground tabular-nums">{members.data.length}</span>
						) : null}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Members</DialogTitle>
					<DialogDescription>
						Everyone here shares the same computer. Invites land in the invitee's Invites tab.
					</DialogDescription>
				</DialogHeader>
				<InviteForm workspace={workspace} />
				<People workspace={workspace} />
				<ul className="flex flex-col divide-y">
					{members.isPending
						? ["a", "b"].map((key) => (
								<li key={key} className="py-3">
									<Skeleton className="h-8" />
								</li>
							))
						: members.data?.map((member) => <Item key={member.userId} member={member} />)}
					{invites.data?.map((invite) => (
						<Pending key={invite.id} invite={invite} workspace={workspace} />
					))}
				</ul>
			</DialogContent>
		</Dialog>
	);
}
