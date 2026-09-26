import { Skeleton } from "~/components/ui/skeleton";

export function Loading() {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{["a", "b", "c"].map((key) => (
				<li key={key}>
					<Skeleton className="h-32 rounded-2xl" />
				</li>
			))}
		</ul>
	);
}
