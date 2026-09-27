// TODO: match the dock to the Figma file and the real macOS dock (liquid glass, magnification, running dots)
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export type DockApp = { name: string; icon: string; onOpen: () => void };

export function Dock({ apps }: { apps: DockApp[] }) {
	return (
		<div className="flex items-center gap-1 rounded-2xl border border-white/20 bg-white/40 p-1.5 shadow-lg backdrop-blur-xl dark:bg-black/40">
			{apps.map((app) => (
				<Tooltip key={app.name}>
					<TooltipTrigger asChild>
						<button
							aria-label={app.name}
							className="size-11 transition hover:scale-105"
							onClick={app.onOpen}
							type="button"
						>
							<img alt="" className="size-full" draggable={false} src={app.icon} />
						</button>
					</TooltipTrigger>
					<TooltipContent>{app.name}</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}
