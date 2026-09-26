import { Text } from "~/components/text";
import { Skeleton } from "~/components/ui/skeleton";

export function Loading() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-6">
				<Skeleton className="h-5 w-24" />
				<div>
					<Text.HeadingSkeleton />
					<Text.SubtextSkeleton />
				</div>
			</div>
			<Skeleton className="h-16 max-w-sm" />
			<Skeleton className="h-64" />
		</div>
	);
}
