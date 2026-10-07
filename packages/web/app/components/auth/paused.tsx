import { Core } from "@tomo/api";
import { Moon } from "lucide-react";
import { motion } from "motion/react";

export function Paused({ href }: { href: string }) {
	return (
		<div className="flex max-w-md items-start gap-3 text-sm leading-relaxed">
			<span className="relative mt-1 shrink-0 text-foreground">
				<Moon className="size-4" />
				{[0, 1, 2].map((i) => (
					<motion.span
						animate={{ opacity: [0, 0.7, 0], x: [0, 4 + i * 3], y: [0, -8 - i * 3] }}
						className="pointer-events-none absolute -top-1 right-0 font-mono text-[9px] text-muted-foreground"
						key={i}
						transition={{ delay: i * 0.9, duration: 2.7, ease: "easeOut", repeat: Infinity }}
					>
						z
					</motion.span>
				))}
			</span>
			<p className="text-muted-foreground">
				<span className="text-foreground">{Core.NAME} is taking a nap.</span> Every workspace runs
				its own sandbox, and keeping those servers warm got expensive, so sign-ups are paused. The
				demo still works, and the code is{" "}
				<a
					className="text-foreground underline underline-offset-4 transition hover:opacity-70"
					href={href}
					rel="noreferrer"
					target="_blank"
				>
					open source
				</a>
				.
			</p>
		</div>
	);
}
