import { motion } from "motion/react";
import { useTyped } from "~/hooks/use-typed";

const Command = 'codex "build me a landing page"';
const Output = [
	{ text: "• Writing src/App.tsx", tone: "text-[#878580]" },
	{ text: "• Installing react, vite", tone: "text-[#878580]" },
	{ text: "✓ Ready on localhost:5173", tone: "text-[#879A39]" },
];

export function Terminal({ active, instant }: { active: boolean; instant: boolean }) {
	const typed = useTyped(Command, active, { speed: 38, delay: 500, instant });
	const done = typed.length === Command.length;

	return (
		<div className="flex flex-col gap-[0.35cqw] p-[1cqw] font-mono text-[#CECDC3] text-[1cqw] leading-snug">
			<span>
				<span className="text-[#3AA99F]">~/app</span> <span className="text-[#878580]">$</span>{" "}
				{typed}
				{done ? null : (
					<span className="inline-block h-[1.1cqw] w-[0.55cqw] translate-y-[0.15cqw] bg-[#CECDC3]" />
				)}
			</span>
			{done
				? Output.map((line, index) => (
						<motion.span
							animate={{ opacity: 1, x: 0 }}
							className={line.tone}
							initial={instant ? false : { opacity: 0, x: "-0.5cqw" }}
							key={line.text}
							transition={{ delay: 0.3 + index * 0.45 }}
						>
							{line.text}
						</motion.span>
					))
				: null}
		</div>
	);
}
