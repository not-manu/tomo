import { Bot } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type Point = { x: number; y: number };

export function Cursor({
	name,
	color,
	at,
	visible,
	agent,
	click,
}: {
	name: string;
	color: string;
	at: Point;
	visible: boolean;
	agent?: boolean;
	click?: number | undefined;
}) {
	return (
		<AnimatePresence>
			{visible ? (
				<motion.div
					animate={{ left: `${at.x}%`, top: `${at.y}%`, opacity: 1 }}
					className="pointer-events-none absolute z-50"
					exit={{ opacity: 0 }}
					initial={{ left: `${at.x}%`, top: `${at.y}%`, opacity: 0 }}
					transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
				>
					{click ? (
						<motion.span
							animate={{ scale: [0.2, 1.6], opacity: [0.7, 0] }}
							className="absolute -top-[1cqw] -left-[1cqw] size-[2cqw] rounded-full"
							key={click}
							style={{ backgroundColor: color }}
							transition={{ delay: 0.85, duration: 0.5 }}
						/>
					) : null}
					<svg
						aria-hidden="true"
						className="relative size-[1.6cqw] drop-shadow"
						fill={color}
						stroke="white"
						strokeWidth="1.5"
						viewBox="0 0 24 24"
					>
						<path d="M4 3l16 7.5-7 2-2.5 7.5z" />
					</svg>
					<span
						className="relative ml-[1cqw] -mt-[0.3cqw] flex w-max items-center gap-[0.3cqw] rounded-full px-[0.6cqw] py-[0.2cqw] font-medium text-[0.95cqw] text-white shadow"
						style={{ backgroundColor: color }}
					>
						{agent ? <Bot className="size-[1cqw]" /> : null}
						{name}
					</span>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
