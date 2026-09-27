import { Workspace } from "@tomo/api";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTyped } from "~/hooks/use-typed";
import { cn } from "~/lib/utils";
import { Browser } from "./browser";
import { Cursor, type Point } from "./cursor";
import { Dock, type DockApp } from "./dock";
import { Editor } from "./editor";
import { Frame } from "./frame";
import { Terminal } from "./terminal";

const Durations = [900, 1200, 3800, 1100, 1300, 1200, 2200, 3000];
const Last = Durations.length - 1;

const Before = "Hello, world";
const After = "Ship it, together.";

const People = {
	manu: { name: "Manu", color: "#4385BE" },
	ana: { name: "Ana", color: "#CE5D97" },
	codex: { name: "Codex", color: "#DA702C" },
};

const Icons: Record<DockApp, Point> = {
	Finder: { x: 44.3, y: 94 },
	Browser: { x: 48.1, y: 94 },
	Terminal: { x: 51.9, y: 94 },
	Editor: { x: 55.7, y: 94 },
};

const Manu: Point[] = [
	{ x: 70, y: 60 },
	Icons.Terminal,
	{ x: 30, y: 30 },
	Icons.Browser,
	{ x: 70, y: 45 },
	{ x: 72, y: 50 },
	{ x: 72, y: 50 },
	{ x: 76, y: 38 },
];

const Pressed: Partial<Record<number, DockApp>> = { 1: "Terminal", 3: "Browser", 5: "Editor" };

const Captions = [
	{ title: "One shared desktop", body: "Your team and its agents on the same computer." },
	{ title: "Agents work beside you", body: "Codex runs in the same terminal you do." },
	{ title: "Preview it live", body: "Run any web app and open it right on the desktop." },
	{ title: "Edit together", body: "Change code together and watch it update instantly." },
];

function caption(step: number) {
	if (step <= 1) return 0;
	if (step === 2) return 1;
	if (step <= 4) return 2;
	return 3;
}

export function Root({ className }: { className?: string }) {
	const stage = useRef<HTMLDivElement>(null);
	const visible = useInView(stage, { amount: 0.3 });
	const reduced = useReducedMotion() ?? false;
	const [step, setStep] = useState(0);
	const [loop, setLoop] = useState(0);
	const current = reduced ? Last : step;
	const typed = useTyped(After, current >= 6, { speed: 55, delay: 700, instant: reduced });

	useEffect(() => {
		if (reduced || !visible) return;
		const timer = setTimeout(() => {
			if (step === Last) setLoop((value) => value + 1);
			setStep((step + 1) % Durations.length);
		}, Durations[step]);
		return () => clearTimeout(timer);
	}, [step, visible, reduced]);

	const running: DockApp[] = [
		...(current >= 2 ? (["Terminal"] as const) : []),
		...(current >= 4 ? (["Browser"] as const) : []),
		...(current >= 6 ? (["Editor"] as const) : []),
	];
	const pressed = Pressed[current];

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div
				aria-label="Animated demo of a shared Tomo desktop"
				className="@container relative aspect-video w-full select-none overflow-hidden rounded-2xl border bg-muted shadow-sm"
				ref={stage}
				role="img"
			>
				<img
					alt=""
					className="absolute inset-0 size-full object-cover"
					draggable={false}
					src={Workspace.wallpaperSrc(Workspace.DefaultWallpaper)}
				/>
				<Frame
					dark
					version={loop}
					open={current >= 2}
					rect={{ x: 5, y: 7, w: 42, h: 42 }}
					title="Terminal"
				>
					<Terminal active={current >= 2} instant={reduced} />
				</Frame>
				<Frame
					version={loop}
					open={current >= 4}
					rect={{ x: 50, y: 7, w: 45, h: 70 }}
					title="localhost:5173"
				>
					<Browser heading={current >= 7 ? After : Before} />
				</Frame>
				<Frame
					version={loop}
					open={current >= 6}
					rect={{ x: 8, y: 53, w: 38, h: 30 }}
					title="App.tsx"
				>
					<Editor
						color={People.ana.color}
						heading={current >= 6 ? typed : Before}
						name={People.ana.name}
					/>
				</Frame>
				<Dock pressed={pressed} running={running} />
				<Cursor
					at={Manu[current] ?? { x: 70, y: 60 }}
					click={pressed && current !== 5 ? current : undefined}
					color={People.manu.color}
					name={People.manu.name}
					visible
				/>
				<Cursor
					agent
					at={current === 2 ? { x: 24, y: 20 } : { x: 40, y: 13 }}
					color={People.codex.color}
					name={People.codex.name}
					visible={current >= 2}
				/>
				<Cursor
					at={current === 5 ? Icons.Editor : current === 6 ? { x: 27, y: 64 } : { x: 31, y: 72 }}
					click={current === 5 ? current : undefined}
					color={People.ana.color}
					name={People.ana.name}
					visible={current >= 5}
				/>
			</div>
			<ol className="grid gap-4 sm:grid-cols-4">
				{Captions.map((item, index) => {
					const active = caption(current) === index;
					return (
						<li
							className={cn(
								"flex flex-col gap-1 transition-opacity duration-500",
								active ? "opacity-100" : "opacity-40",
							)}
							key={item.title}
						>
							<span className="h-0.5 w-full overflow-hidden rounded-full bg-border">
								<span
									className={cn(
										"block h-full bg-foreground transition-[width] duration-500",
										active ? "w-full" : "w-0",
									)}
								/>
							</span>
							<span className="pt-2 font-medium text-sm">{item.title}</span>
							<span className="text-muted-foreground text-sm">{item.body}</span>
						</li>
					);
				})}
			</ol>
		</div>
	);
}
