import { Workspace } from "@tomo/api";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useAcceptInvite, useDeclineInvite } from "~/hooks/use-invites";
import type { hono, InferHono } from "~/lib/hono";

type Invite = InferHono<typeof hono.api.invites.$get>[number];

export function Item({ invite }: { invite: Invite }) {
	const navigate = useNavigate();
	const accept = useAcceptInvite();
	const decline = useDeclineInvite();
	const busy = accept.isPending || decline.isPending;

	async function handleAccept() {
		try {
			const workspace = await accept.mutateAsync(invite.id);
			toast.success(`Joined ${workspace.name}`);
			navigate(Workspace.path(workspace));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	async function handleDecline() {
		try {
			await decline.mutateAsync(invite.id);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<li className="flex flex-wrap items-center gap-4 p-5">
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium">{invite.workspaceName}</p>
				<p className="text-muted-foreground text-sm">
					{invite.invitedBy} invited you as {invite.role}
				</p>
			</div>
			<div className="flex gap-2">
				<Button disabled={busy} onClick={handleDecline} variant="outline">
					<X data-icon="inline-start" />
					Decline
				</Button>
				<Button disabled={busy} onClick={handleAccept}>
					<Check data-icon="inline-start" />
					Accept
				</Button>
			</div>
		</li>
	);
}
