import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useUsage } from "~/hooks/use-workspace";
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

	if (isPending) return <Skeleton className="h-40" />;
	if (error) return <p className="text-destructive text-sm">{error.message}</p>;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-2 text-sm">
					<span className="rounded-full border px-2 py-0.5 font-medium">
						{usage.plan.name} plan
					</span>
					<span className="text-muted-foreground">
						{usage.running ? "Computer is running" : "Computer is asleep"}
					</span>
				</div>
				{/* TODO: link to plans once paid tiers exist */}
				<Button disabled size="sm" variant="outline">
					Upgrade · soon
				</Button>
			</div>
			<div className="grid gap-6 sm:grid-cols-3">
				<Meter format={cores} label="CPU" limit={usage.cpu.limit} used={usage.cpu.used} />
				<Meter format={bytes} label="Memory" limit={usage.memory.limit} used={usage.memory.used} />
				<Meter
					format={bytes}
					label="Storage"
					limit={usage.storage.limit}
					used={usage.storage.used}
				/>
			</div>
		</div>
	);
}
