import { Invite } from "@tomo/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { User } from "~/components/user";
import { useCreateInvite, usePeople, useWorkspaceInvites } from "~/hooks/use-invites";
import { useMembers } from "~/hooks/use-workspace";
import type { Detail } from "../header/root";

export function People({ workspace }: { workspace: Detail }) {
	const { data: people = [] } = usePeople();
	const { data: members = [] } = useMembers(workspace.id);
	const { data: invites = [] } = useWorkspaceInvites(workspace.id);
	const create = useCreateInvite(workspace.id);

	const taken = new Set([
		...members.map((member) => Invite.normalizeEmail(member.email)),
		...invites.map((invite) => invite.email),
	]);
	const suggestions = people.filter((person) => !taken.has(person.email));
	if (suggestions.length === 0) return null;

	async function invite(email: string, label: string) {
		try {
			await create.mutateAsync({ email, role: "member" });
			toast.success(`Invited ${label}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-muted-foreground text-xs">People you know</span>
			<ul className="flex flex-wrap gap-1.5">
				{suggestions.map((person) => {
					const label = person.name ?? person.email.split("@")[0] ?? person.email;
					return (
						<li key={person.email}>
							<button
								className="group flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5 text-sm transition hover:bg-muted disabled:opacity-50"
								disabled={create.isPending}
								onClick={() => void invite(person.email, label)}
								title={`Invite ${person.email}`}
								type="button"
							>
								<User.Avatar
									id={person.userId ?? person.email}
									image={person.image}
									name={label}
									size="sm"
								/>
								<span className="max-w-32 truncate">{label}</span>
								<Plus className="size-3.5 text-muted-foreground transition group-hover:text-foreground" />
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
