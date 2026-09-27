import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

const FLOOR = 0.06;
const CEILING = 0.94;

function display(ratio: number) {
	return FLOOR + (CEILING - FLOOR) * Math.sqrt(ratio);
}

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
	const ratio = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 0;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex cursor-default flex-col gap-1.5 text-xs">
					<div className="flex items-baseline justify-between gap-3">
						<span className="font-medium">{label}</span>
						<span className="text-muted-foreground tabular-nums">{format(used)}</span>
					</div>
					<div className="h-1 overflow-hidden rounded-full bg-muted">
						<div
							className={cn(
								"h-full rounded-full transition-[width] duration-700 ease-out",
								ratio >= 0.9
									? "bg-red-600 dark:bg-red-400"
									: ratio >= 0.7
										? "bg-orange-600 dark:bg-orange-400"
										: "bg-foreground",
							)}
							style={{ width: `${display(ratio) * 100}%` }}
						/>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent className="tabular-nums">{format(limit)} limit</TooltipContent>
		</Tooltip>
	);
}
