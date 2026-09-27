import { cn } from "~/lib/utils";

export function Meter({
	label,
	used,
	limit,
	format,
}: {
	label: string;
	used: number;
	limit: number;
	format: (value: number) => string;
}) {
	const ratio = limit > 0 ? Math.min(1, used / limit) : 0;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-baseline justify-between gap-4 text-sm">
				<span className="font-medium">{label}</span>
				<span className="text-muted-foreground tabular-nums">
					{format(used)} / {format(limit)}
				</span>
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						"h-full rounded-full transition-[width] duration-500",
						ratio >= 0.9
							? "bg-red-600 dark:bg-red-400"
							: ratio >= 0.7
								? "bg-orange-600 dark:bg-orange-400"
								: "bg-foreground",
					)}
					style={{ width: `${Math.max(ratio * 100, used > 0 ? 1 : 0)}%` }}
				/>
			</div>
		</div>
	);
}
