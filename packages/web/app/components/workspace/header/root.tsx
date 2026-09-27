import { Workspace } from "@tomo/api";
import { ArrowLeft, Settings } from "lucide-react";
import { Text } from "~/components/text";
import { Tomo } from "~/components/tomo";
import { Button } from "~/components/ui/button";
import type { hono, InferHono } from "~/lib/hono";
import { Members } from "../members";

export type Detail = InferHono<(typeof hono.api.workspace)[":id"]["$get"]>;

export function Root({ workspace }: { workspace: Detail }) {
	const owner = workspace.role === "owner";

	return (
		<div className="flex flex-col gap-6">
			<Tomo.Link
				className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition hover:text-foreground"
				to="/app"
			>
				<ArrowLeft className="size-4" />
				Workspaces
			</Tomo.Link>
			<div className="flex flex-wrap items-start justify-between gap-6">
				<div className="min-w-0">
					<Text.Heading className="truncate">{workspace.name}</Text.Heading>
					<Text.Subtext>{owner ? "You own this workspace." : "You're a member."}</Text.Subtext>
				</div>
				<div className="flex items-center gap-2">
					<Members.Root workspace={workspace} />
					<Button aria-label="Workspace settings" asChild size="icon" variant="outline">
						<Tomo.Link to={`${Workspace.path(workspace)}/settings`}>
							<Settings />
						</Tomo.Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
