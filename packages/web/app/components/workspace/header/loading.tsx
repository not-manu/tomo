import { Text } from "~/components/text";
import { Skeleton } from "~/components/ui/skeleton";

export function Loading() {
	return (
		<div className="flex flex-col gap-6">
			<Skeleton className="h-5 w-24" />
			<div className="flex items-start justify-between gap-6">
				<div>
					<Text.HeadingSkeleton />
					<Text.SubtextSkeleton />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="size-9" />
					<Skeleton className="size-9" />
				</div>
			</div>
		</div>
	);
}
