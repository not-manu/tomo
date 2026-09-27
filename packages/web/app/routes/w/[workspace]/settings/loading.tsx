import { Text } from "~/components/text";
import { Skeleton } from "~/components/ui/skeleton";

export function Loading() {
	return (
		<div className="flex flex-col gap-10">
			<div>
				<Text.HeadingSkeleton />
				<Text.SubtextSkeleton />
			</div>
			<Skeleton className="h-16 max-w-sm" />
			<Skeleton className="h-64" />
		</div>
	);
}
