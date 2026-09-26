import { Skeleton } from "~/components/ui/skeleton";
import { Workspace } from "~/components/workspace";

export function Loading() {
	return (
		<div className="flex flex-col gap-10">
			<Workspace.Header.Loading />
			<Skeleton className="aspect-video rounded-2xl" />
		</div>
	);
}
