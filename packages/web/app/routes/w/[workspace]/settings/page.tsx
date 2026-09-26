import { Workspace as WorkspaceEntity } from "@tomo/api";
import { ArrowLeft } from "lucide-react";
import { Navigate, useParams } from "react-router";
import { Text } from "~/components/text";
import { Tomo } from "~/components/tomo";
import { Workspace } from "~/components/workspace";
import { useWorkspace } from "~/hooks/use-workspace";
import { Loading } from "./loading";

export default function WorkspaceSettingsPage() {
	const { workspace: id = "" } = useParams();
	const { data: workspace, isPending } = useWorkspace(id);

	if (isPending) return <Loading />;
	if (!workspace) return <Navigate replace to="/app" />;

	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-6">
				<Tomo.Link
					className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition hover:text-foreground"
					to={WorkspaceEntity.path(workspace)}
				>
					<ArrowLeft className="size-4" />
					{workspace.name}
				</Tomo.Link>
				<div>
					<Text.Heading>Settings</Text.Heading>
					<Text.Subtext>Name, wallpaper and the scary buttons.</Text.Subtext>
				</div>
			</div>
			<Workspace.Settings.Root workspace={workspace} />
		</div>
	);
}
