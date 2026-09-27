import { Skeleton } from "~/components/ui/skeleton";

export function Loading() {
	return (
		<ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{["a", "b", "c", "d"].map((key) => (
				<li key={key} className="flex flex-col gap-2">
					<Skeleton className="aspect-video rounded-2xl" />
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-3 w-1/3" />
				</li>
			))}
		</ul>
	);
}
