import type { PointerEvent } from "react";
import { Navigate, useParams } from "react-router";
import { Workspace } from "~/components/workspace";
import { usePresence } from "~/hooks/use-presence";
import { useWorkspace } from "~/hooks/use-workspace";
import { Loading } from "./loading";

export default function WorkspacePage() {
	const { workspace: id = "" } = useParams();
	const { data: workspace, isPending } = useWorkspace(id);
	const { cursors, move } = usePresence(id);

	if (isPending) return <Loading />;
	if (!workspace) return <Navigate replace to="/app" />;

	function onPointerMove(event: PointerEvent<HTMLDivElement>) {
		const rect = event.currentTarget.getBoundingClientRect();
		move({
			x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
			y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
		});
	}

	return (
		<div className="flex flex-col gap-10">
			<Workspace.Header.Root workspace={workspace} />
			<div
				className="relative aspect-video overflow-hidden rounded-2xl border"
				onPointerMove={onPointerMove}
				onPointerLeave={() => move(null)}
			>
				<Workspace.Wallpaper.Desktop className="absolute inset-0" workspace={workspace} />
				<Workspace.Cursors.Root className="absolute inset-0" cursors={cursors} />
			</div>
		</div>
	);
}
