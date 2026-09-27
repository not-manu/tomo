import { Navigate, useParams } from "react-router";
import { Workspace } from "~/components/workspace";
import { useWorkspace } from "~/hooks/use-workspace";
import { Loading } from "./loading";

export default function WorkspacePage() {
	const { workspace: id = "" } = useParams();
	const { data: workspace, isPending } = useWorkspace(id);

	if (isPending) return <Loading />;
	if (!workspace) return <Navigate replace to="/app" />;

	return (
		<div className="flex flex-col gap-10">
			<Workspace.Header.Root workspace={workspace} />
			{/* TODO: add the full-screen desktop route at Workspace.desktopPath that joins presence and shows cursors */}
			<Workspace.Lobby.Root className="aspect-video rounded-2xl border" workspace={workspace} />
		</div>
	);
}
