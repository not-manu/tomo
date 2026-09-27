import { User } from "@tomo/api";
import { Invite } from "~/components/invite";
import { Text } from "~/components/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Workspace } from "~/components/workspace";
import { useInbox } from "~/hooks/use-invites";
import { useSession } from "~/lib/auth";

export default function AppPage() {
	const { data: session } = useSession();
	const { data: inbox } = useInbox();
	const firstName = session ? User.firstName(session.user) : "";
	const pending = inbox?.length ?? 0;

	return (
		<Tabs className="gap-10" defaultValue="workspaces">
			<TabsList>
				<TabsTrigger value="workspaces">Workspaces</TabsTrigger>
				<TabsTrigger value="invites">
					Invites
					{pending > 0 ? (
						<span className="rounded-full bg-primary px-1.5 text-primary-foreground text-xs tabular-nums">
							{pending}
						</span>
					) : null}
				</TabsTrigger>
			</TabsList>
			<div className="flex flex-wrap items-end justify-between gap-6">
				<div>
					<Text.Heading>Welcome{firstName && `, ${firstName}`}</Text.Heading>
					<Text.Subtext>Your workspaces, and the ones you've been invited to.</Text.Subtext>
				</div>
				<Workspace.Create.Root />
			</div>
			<TabsContent value="workspaces">
				<Workspace.List.Root />
			</TabsContent>
			<TabsContent value="invites">
				<Invite.Inbox.Root />
			</TabsContent>
		</Tabs>
	);
}
