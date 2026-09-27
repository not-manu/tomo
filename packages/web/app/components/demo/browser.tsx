import { RotateCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function Browser({ heading }: { heading: string }) {
	return (
		<div className="flex size-full flex-col">
			<div className="flex h-[2.2cqw] shrink-0 items-center gap-[0.6cqw] border-black/10 border-b px-[0.8cqw]">
				<RotateCw className="size-[0.9cqw] text-[#6F6E69]" />
				<span className="grow rounded-[0.4cqw] bg-black/5 py-[0.2cqw] text-center font-mono text-[#6F6E69] text-[0.8cqw]">
					localhost:5173
				</span>
			</div>
			<div className="relative flex grow flex-col items-center justify-center gap-[1cqw] overflow-hidden bg-gradient-to-b from-[#E6E4D9] to-[#FFFCF0] p-[2cqw]">
				<AnimatePresence mode="popLayout">
					<motion.span
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						className="text-center font-semibold text-[#100F0F] text-[2.4cqw] tracking-tight"
						exit={{ opacity: 0, y: "-1cqw", filter: "blur(4px)" }}
						initial={{ opacity: 0, y: "1cqw", filter: "blur(4px)" }}
						key={heading}
						transition={{ duration: 0.45 }}
					>
						{heading}
					</motion.span>
				</AnimatePresence>
				<span className="h-[0.7cqw] w-3/5 rounded-full bg-black/10" />
				<span className="h-[0.7cqw] w-2/5 rounded-full bg-black/10" />
				<span className="mt-[0.6cqw] rounded-full bg-[#100F0F] px-[1.4cqw] py-[0.5cqw] font-medium text-[#FFFCF0] text-[0.9cqw]">
					Get started
				</span>
			</div>
		</div>
	);
}
