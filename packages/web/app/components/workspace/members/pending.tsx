import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useRevokeInvite } from "~/hooks/use-invites";
import type { hono, InferHono } from "~/lib/hono";
import type { Detail } from "../header/root";

type Invite = InferHono<(typeof hono.api.workspace)[":id"]["invites"]["$get"]>[number];

export function Pending({ invite, workspace }: { invite: Invite; workspace: Detail }) {
	const revoke = useRevokeInvite(workspace.id);

	async function handleRevoke() {
		try {
			await revoke.mutateAsync(invite.id);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<li className="flex items-center gap-3 py-3">
			<span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Mail className="size-3.5" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm">{invite.email}</p>
				<p className="text-muted-foreground text-xs">Invited · {invite.role}</p>
			</div>
			<Button
				aria-label={`Revoke invite for ${invite.email}`}
				disabled={revoke.isPending}
				onClick={handleRevoke}
				size="icon-xs"
				variant="ghost"
			>
				<X />
			</Button>
		</li>
	);
}
