// TODO: match the dock to the Figma file and the real macOS dock (liquid glass, magnification, running dots)
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export function Dock({ onTerminal }: { onTerminal: () => void }) {
	return (
		<div className="flex items-center gap-1 rounded-2xl border border-white/20 bg-white/40 p-1.5 shadow-lg backdrop-blur-xl dark:bg-black/40">
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						aria-label="Terminal"
						className="size-11 transition hover:scale-105"
						onClick={onTerminal}
						type="button"
					>
						<img alt="" className="size-full" draggable={false} src="/apps/terminal.png" />
					</button>
				</TooltipTrigger>
				<TooltipContent>Terminal</TooltipContent>
			</Tooltip>
		</div>
	);
}
