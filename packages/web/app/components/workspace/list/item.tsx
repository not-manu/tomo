import { Workspace } from "@tomo/api";
import { ExternalLink, LogOut, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Tomo } from "~/components/tomo";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "~/components/ui/context-menu";
import type { hono, InferHono } from "~/lib/hono";
import { Danger } from "../danger";
import { Wallpaper } from "../wallpaper";

type Item = InferHono<typeof hono.api.workspace.$get>[number];

export function Item({ workspace }: { workspace: Item }) {
	const navigate = useNavigate();
	const [confirm, setConfirm] = useState(false);
	const owner = workspace.role === "owner";
	const path = Workspace.path(workspace);
	const created = new Date(workspace.createdAt).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});

	return (
		<li className="contents">
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<Tomo.Link
						className="group flex flex-col gap-2 rounded-2xl focus-visible:outline-none"
						to={path}
					>
						<Wallpaper.Desktop
							className="aspect-square rounded-2xl border shadow-sm transition group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring"
							workspace={workspace}
						/>
						<span className="flex flex-col px-1">
							<span className="truncate font-medium text-sm">{workspace.name}</span>
							<span className="text-muted-foreground text-xs">
								<span className="capitalize">{workspace.role}</span> · {created}
							</span>
						</span>
					</Tomo.Link>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onSelect={() => navigate(path)}>
						<ExternalLink />
						Open
					</ContextMenuItem>
					<ContextMenuItem onSelect={() => navigate(`${path}/settings`)}>
						<Settings />
						Settings
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onSelect={() => setConfirm(true)} variant="destructive">
						{owner ? <Trash2 /> : <LogOut />}
						{owner ? "Delete" : "Leave"}
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<Danger.Root onOpenChange={setConfirm} open={confirm} workspace={workspace} />
		</li>
	);
}
