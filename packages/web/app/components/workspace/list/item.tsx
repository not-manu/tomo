import { Workspace } from "@tomo/api";
import { Tomo } from "~/components/tomo";
import type { InferHono } from "~/lib/hono";
import type { hono } from "~/lib/hono";

type Item = InferHono<typeof hono.api.workspace.$get>[number];

export function Item({ workspace }: { workspace: Item }) {
	const created = new Date(workspace.createdAt).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});

	return (
		<li className="contents">
			<Tomo.Link
				className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-5 transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
				to={Workspace.path(workspace)}
			>
				<span className="truncate font-medium">{workspace.name}</span>
				<span className="flex items-center justify-between text-muted-foreground text-xs">
					<span className="capitalize">{workspace.role}</span>
					<span>{created}</span>
				</span>
			</Tomo.Link>
		</li>
	);
}
