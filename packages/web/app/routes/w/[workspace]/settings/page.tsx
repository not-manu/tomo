import { Navigate, useParams } from "react-router";
import { Text } from "~/components/text";
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
			<div>
				<Text.Heading>Settings</Text.Heading>
				<Text.Subtext>Name, wallpaper and the scary buttons.</Text.Subtext>
			</div>
			<Workspace.Settings.Root workspace={workspace} />
		</div>
	);
}
