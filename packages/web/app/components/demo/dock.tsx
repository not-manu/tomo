import { motion } from "motion/react";
import { cn } from "~/lib/utils";

export const DockApps = [
	{ name: "Finder", icon: "/apps/finder.png" },
	{ name: "Browser", icon: "/apps/browser.png" },
	{ name: "Terminal", icon: "/apps/terminal.png" },
	{ name: "Editor", icon: "/apps/document.png" },
] as const;

export type DockApp = (typeof DockApps)[number]["name"];

export function Dock({ running, pressed }: { running: DockApp[]; pressed?: DockApp | undefined }) {
	return (
		<div className="absolute inset-x-0 bottom-[2%] z-40 flex justify-center">
			<div className="flex items-end gap-[0.6cqw] rounded-[1.4cqw] border border-white/40 bg-white/25 px-[0.7cqw] py-[0.6cqw] shadow-lg backdrop-blur-xl">
				{DockApps.map((app) => (
					<motion.span
						animate={{ scale: pressed === app.name ? [1, 0.85, 1.12, 1] : 1 }}
						className="relative flex flex-col items-center"
						key={app.name}
						transition={{ delay: pressed === app.name ? 0.85 : 0, duration: 0.45 }}
					>
						<img alt="" className="size-[3.2cqw] drop-shadow" draggable={false} src={app.icon} />
						<span
							className={cn(
								"absolute -bottom-[0.45cqw] size-[0.3cqw] rounded-full bg-black/70 transition-opacity",
								running.includes(app.name) ? "opacity-100" : "opacity-0",
							)}
						/>
					</motion.span>
				))}
			</div>
		</div>
	);
}
