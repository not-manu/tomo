import { SquareTerminal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export function Dock({ onTerminal }: { onTerminal: () => void }) {
	return (
		<div className="flex items-center gap-1 rounded-2xl border border-white/20 bg-white/40 p-1.5 shadow-lg backdrop-blur-xl dark:bg-black/40">
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						aria-label="Terminal"
						className="flex size-10 items-center justify-center rounded-xl bg-neutral-950 text-neutral-100 transition hover:scale-105"
						onClick={onTerminal}
						type="button"
					>
						<SquareTerminal className="size-5" />
					</button>
				</TooltipTrigger>
				<TooltipContent>Terminal</TooltipContent>
			</Tooltip>
		</div>
	);
}
