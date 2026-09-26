import { Skeleton } from "~/components/ui/skeleton";

export function Loading() {
	return (
		<ul className="flex flex-col divide-y rounded-2xl border">
			{["a", "b"].map((key) => (
				<li key={key} className="p-5">
					<Skeleton className="h-10" />
				</li>
			))}
		</ul>
	);
}
