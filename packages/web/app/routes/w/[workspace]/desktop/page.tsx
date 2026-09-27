import { Navigate, useParams, useSearchParams } from "react-router";
import { Desktop } from "~/components/desktop";
import { Skeleton } from "~/components/ui/skeleton";
import { useDesktops } from "~/hooks/use-desktops";
import { LiveProvider, useLiveConnection } from "~/hooks/use-live";
import { useWorkspace } from "~/hooks/use-workspace";

export default function DesktopPage() {
	const { workspace: id = "" } = useParams();
	const [params, setParams] = useSearchParams();
	const { data: workspace, isPending } = useWorkspace(id);
	const { data: desktops = [] } = useDesktops(id);
	const selected = params.get("d");
	const active = desktops.find((desktop) => desktop.id === selected)?.id ?? desktops[0]?.id;
	const { cursors, viewers, move, live } = useLiveConnection(id, active);

	if (!isPending && !workspace) return <Navigate replace to="/app" />;

	function select(desktopId: string) {
		setParams({ d: desktopId }, { replace: true });
	}

	return (
		<LiveProvider value={live}>
			<main className="flex h-svh flex-col gap-2 bg-background p-2 sm:p-3">
				{desktops.length > 0 ? (
					<Desktop.Tabs
						active={active}
						desktops={desktops}
						onSelect={select}
						viewers={viewers}
						workspaceId={id}
					/>
				) : (
					<Skeleton className="h-9 w-48 rounded-xl" />
				)}
				{workspace && active ? (
					<Desktop.Surface
						className="grow rounded-2xl border"
						cursors={cursors}
						desktopId={active}
						key={active}
						onMove={move}
						workspace={workspace}
					/>
				) : (
					<Skeleton className="grow rounded-2xl" />
				)}
			</main>
		</LiveProvider>
	);
}
