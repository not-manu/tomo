import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useUsage } from "~/hooks/use-workspace";
import { cn } from "~/lib/utils";
import { Meter } from "./meter";

function bytes(value: number) {
	if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(1)} GB`;
	if (value >= 1024 ** 2) return `${Math.round(value / 1024 ** 2)} MB`;
	return `${Math.round(value / 1024)} KB`;
}

function cores(value: number) {
	return `${value.toFixed(value < 1 ? 2 : 1)} vCPU`;
}

export function Root({ workspace }: { workspace: { id: string } }) {
	const { data: usage, isPending, error } = useUsage(workspace.id);

	if (isPending) return <Skeleton className="h-8" />;
	if (error) return <p className="text-destructive text-xs">{error.message}</p>;

	return (
		<div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex cursor-default items-center gap-2 self-start text-xs">
						<span
							className={cn(
								"size-1.5 rounded-full",
								usage.running ? "bg-green-600 dark:bg-green-400" : "bg-muted-foreground/50",
							)}
						/>
						<span className="font-medium">{usage.plan.name} plan</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					{usage.running ? "Computer is running" : "Computer is asleep"}
				</TooltipContent>
			</Tooltip>
			<Meter format={cores} label="CPU" limit={usage.cpu.limit} used={usage.cpu.used} />
			<Meter format={bytes} label="Memory" limit={usage.memory.limit} used={usage.memory.used} />
			<Meter format={bytes} label="Storage" limit={usage.storage.limit} used={usage.storage.used} />
		</div>
	);
}
