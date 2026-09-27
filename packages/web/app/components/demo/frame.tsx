import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export type Rect = { x: number; y: number; w: number; h: number };

export function Frame({
	open,
	rect,
	title,
	dark,
	version,
	children,
}: {
	open: boolean;
	version: number;
	rect: Rect;
	title: string;
	dark?: boolean;
	children: ReactNode;
}) {
	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className={cn(
						"absolute flex flex-col overflow-hidden rounded-[0.8cqw] border shadow-2xl",
						dark ? "border-white/10 bg-[#100F0F]" : "border-black/10 bg-[#FFFCF0]",
					)}
					exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
					initial={{ opacity: 0, scale: 0.9, y: "2cqw" }}
					key={version}
					style={{
						left: `${rect.x}%`,
						top: `${rect.y}%`,
						width: `${rect.w}%`,
						height: `${rect.h}%`,
						transformOrigin: "bottom center",
					}}
					transition={{ type: "spring", stiffness: 260, damping: 24 }}
				>
					<div
						className={cn(
							"relative flex h-[2.4cqw] shrink-0 items-center gap-[0.45cqw] px-[0.9cqw]",
							dark ? "" : "border-black/10 border-b",
						)}
					>
						<span className="size-[0.8cqw] rounded-full bg-[#FF5F57]" />
						<span className="size-[0.8cqw] rounded-full bg-[#FEBC2E]" />
						<span className="size-[0.8cqw] rounded-full bg-[#28C840]" />
						<span
							className={cn(
								"absolute inset-x-0 text-center text-[0.9cqw]",
								dark ? "font-mono text-[#CECDC3]" : "text-[#6F6E69]",
							)}
						>
							{title}
						</span>
					</div>
					<div className="relative min-h-0 grow">{children}</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
