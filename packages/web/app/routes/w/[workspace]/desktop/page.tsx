import { Workspace as WorkspaceModel } from "@tomo/api";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { Desktop } from "~/components/desktop";
import { Theme } from "~/components/theme";
import { Tomo } from "~/components/tomo";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Workspace } from "~/components/workspace";
import { useDesktops } from "~/hooks/use-desktops";
import { LiveProvider, useLiveConnection } from "~/hooks/use-live";
import { useSnapshot } from "~/hooks/use-snapshot";
import { useWorkspace } from "~/hooks/use-workspace";
import { useSession } from "~/lib/auth";

export default function DesktopPage() {
	const { workspace: id = "" } = useParams();
	const [params, setParams] = useSearchParams();
	const { data: workspace, isPending } = useWorkspace(id);
	const { data: desktops = [] } = useDesktops(id);
	const selected = params.get("d");
	const active = desktops.find((desktop) => desktop.id === selected)?.id ?? desktops[0]?.id;
	const { cursors, viewers, move, live } = useLiveConnection(id, active);
	const capture = useSnapshot(id);
	const navigate = useNavigate();
	const { data: session } = useSession();
	const [inviting, setInviting] = useState(false);
	const others = new Set(
		Object.values(viewers)
			.flat()
			.map((user) => user.id)
			.filter((user) => user !== session?.user.id),
	);
	const alone = Boolean(session && workspace) && others.size === 0;

	if (!isPending && !workspace) return <Navigate replace to="/app" />;

	function select(desktopId: string) {
		setParams({ d: desktopId }, { replace: true });
	}

	return (
		<LiveProvider value={live}>
			<main className="flex h-svh flex-col gap-2 bg-background p-2 sm:p-3">
				<div className="flex min-w-0 items-center gap-1.5">
					<Tooltip>
						<TooltipTrigger asChild>
							<Tomo.Link
								aria-label="Back to workspace"
								className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
								onClick={(event) => {
									if (event.metaKey || event.ctrlKey || event.shiftKey) return;
									event.preventDefault();
									const leave = () => navigate(WorkspaceModel.path({ id }));
									void Promise.race([capture(), new Promise((done) => setTimeout(done, 800))]).then(
										leave,
									);
								}}
								to={WorkspaceModel.path({ id })}
							>
								<ArrowLeft className="size-4" />
							</Tomo.Link>
						</TooltipTrigger>
						<TooltipContent>{workspace?.name ?? "Workspace"}</TooltipContent>
					</Tooltip>
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
					<div className="grow" />
					{workspace ? (
						<Workspace.Members.Root onOpenChange={setInviting} open={inviting} workspace={workspace}>
							<Button className="rounded-xl" size="sm" variant="ghost">
								<UserPlus data-icon="inline-start" />
								Invite
							</Button>
						</Workspace.Members.Root>
					) : null}
					<Theme.Switch />
				</div>
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
				{session ? (
					<div className="fixed right-6 bottom-6 z-50 w-80">
						<Workspace.Members.Nudge
							alone={alone}
							onInvite={() => setInviting(true)}
							user={session.user}
						/>
					</div>
				) : null}
			</main>
		</LiveProvider>
	);
}
