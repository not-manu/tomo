// TODO: match the dock to the Figma file
import { type MotionValue, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export type DockApp = { name: string; icon: string; running?: boolean; onOpen: () => void };

const Base = 44;
const Max = 76;
const Reach = 150;

function Icon({ app, mouse }: { app: DockApp; mouse: MotionValue<number> }) {
	const ref = useRef<HTMLButtonElement>(null);
	const distance = useTransform(mouse, (x) => {
		const box = ref.current?.getBoundingClientRect();
		if (!box || !Number.isFinite(x)) return Reach;
		return x - (box.left + box.width / 2);
	});
	const target = useTransform(distance, [-Reach, 0, Reach], [Base, Max, Base], { clamp: true });
	const size = useSpring(target, { mass: 0.1, stiffness: 220, damping: 14 });

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					aria-label={app.name}
					className="relative shrink-0 origin-bottom outline-none"
					onClick={app.onOpen}
					ref={ref}
					style={{ width: size, height: size }}
					type="button"
					whileTap={{ scale: 0.92 }}
				>
					<img alt="" className="size-full drop-shadow-md" draggable={false} src={app.icon} />
					<span
						className={cn(
							"absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/70 transition-opacity dark:bg-white/80",
							app.running ? "opacity-100" : "opacity-0",
						)}
					/>
				</motion.button>
			</TooltipTrigger>
			<TooltipContent sideOffset={10}>{app.name}</TooltipContent>
		</Tooltip>
	);
}

export function Dock({ apps }: { apps: DockApp[] }) {
	const mouse = useMotionValue(Number.POSITIVE_INFINITY);

	return (
		<nav
			aria-label="Dock"
			className="relative flex h-[62px] items-end gap-2 rounded-[22px] border border-white/40 bg-white/20 px-2.5 pb-2.5 shadow-[0_10px_40px_-8px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.55),inset_0_-1px_1px_rgb(255_255_255/0.15)] backdrop-blur-2xl backdrop-saturate-[1.8] dark:border-white/15 dark:bg-black/25 dark:shadow-[0_10px_40px_-8px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.18)]"
			onMouseLeave={() => mouse.set(Number.POSITIVE_INFINITY)}
			onMouseMove={(event) => mouse.set(event.clientX)}
		>
			<div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-white/10" />
			{apps.map((app) => (
				<Icon app={app} key={app.name} mouse={mouse} />
			))}
		</nav>
	);
}
