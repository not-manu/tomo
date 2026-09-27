import type { DesktopWindow, Presence } from "@tomo/api";
import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";
import { User } from "~/components/user";
import { cn } from "~/lib/utils";

export type Frame = DesktopWindow.Frame;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Mode = "move" | Edge;

const edges: { edge: Edge; className: string }[] = [
	{ edge: "n", className: "inset-x-3 top-0 h-1.5 cursor-ns-resize" },
	{ edge: "s", className: "inset-x-3 bottom-0 h-1.5 cursor-ns-resize" },
	{ edge: "e", className: "inset-y-3 right-0 w-1.5 cursor-ew-resize" },
	{ edge: "w", className: "inset-y-3 left-0 w-1.5 cursor-ew-resize" },
	{ edge: "nw", className: "top-0 left-0 size-3 cursor-nwse-resize" },
	{ edge: "se", className: "right-0 bottom-0 size-3 cursor-nwse-resize" },
	{ edge: "ne", className: "top-0 right-0 size-3 cursor-nesw-resize" },
	{ edge: "sw", className: "bottom-0 left-0 size-3 cursor-nesw-resize" },
];

const MinWidth = 320;
const MinHeight = 200;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function adjust(
	start: Frame,
	mode: Mode,
	dx: number,
	dy: number,
	min: { w: number; h: number },
): Frame {
	if (mode === "move") {
		return {
			...start,
			x: clamp(start.x + dx, 0, 1 - start.w),
			y: clamp(start.y + dy, 0, 1 - start.h),
		};
	}
	let { x, y, w, h } = start;
	if (mode.includes("e")) w = clamp(start.w + dx, min.w, 1 - start.x);
	if (mode.includes("s")) h = clamp(start.h + dy, min.h, 1 - start.y);
	if (mode.includes("w")) {
		x = clamp(start.x + dx, 0, start.x + start.w - min.w);
		w = start.w + start.x - x;
	}
	if (mode.includes("n")) {
		y = clamp(start.y + dy, 0, start.y + start.h - min.h);
		h = start.h + start.y - y;
	}
	return { x, y, w, h };
}

export function Window({
	title,
	frame,
	maximized,
	z,
	remote,
	dark = false,
	onMove,
	onDrop,
	onFocus,
	onClose,
	onMaximize,
	children,
}: {
	title: string;
	frame: Frame;
	maximized: boolean;
	z: number;
	remote?: Presence.User | undefined;
	dark?: boolean;
	onMove: (frame: Frame) => void;
	onDrop: (frame: Frame) => void;
	onFocus: () => void;
	onClose: () => void;
	onMaximize: () => void;
	children: ReactNode;
}) {
	const drag = useRef<{
		mode: Mode;
		x: number;
		y: number;
		frame: Frame;
		last: Frame;
		width: number;
		height: number;
	}>(undefined);

	function start(mode: Mode, event: PointerEvent<HTMLElement>) {
		if (maximized || event.button !== 0) return;
		const surface = event.currentTarget.closest("[data-surface]")?.getBoundingClientRect();
		if (!surface) return;
		event.stopPropagation();
		event.currentTarget.setPointerCapture(event.pointerId);
		drag.current = {
			mode,
			x: event.clientX,
			y: event.clientY,
			frame,
			last: frame,
			width: surface.width,
			height: surface.height,
		};
	}

	function move(event: PointerEvent<HTMLElement>) {
		const current = drag.current;
		if (!current) return;
		current.last = adjust(
			current.frame,
			current.mode,
			(event.clientX - current.x) / current.width,
			(event.clientY - current.y) / current.height,
			{
				w: Math.min(1, Math.max(0.1, MinWidth / current.width)),
				h: Math.min(1, Math.max(0.1, MinHeight / current.height)),
			},
		);
		onMove(current.last);
	}

	function end() {
		const current = drag.current;
		drag.current = undefined;
		if (current && current.last !== current.frame) onDrop(current.last);
	}

	return (
		<section
			aria-label={title}
			className={cn(
				"absolute flex flex-col overflow-hidden border shadow-2xl",
				dark ? "border-white/10 bg-[#100F0F] text-[#CECDC3]" : "bg-background/95 backdrop-blur-xl",
				maximized ? "inset-0 rounded-none" : "rounded-xl",
				remote && "transition-[left,top,width,height] duration-100 ease-linear",
			)}
			onPointerDownCapture={onFocus}
			style={
				maximized
					? { zIndex: z }
					: {
							zIndex: z,
							left: `${frame.x * 100}%`,
							top: `${frame.y * 100}%`,
							width: `${frame.w * 100}%`,
							height: `${frame.h * 100}%`,
						}
			}
		>
			<div
				aria-label={`${title} title bar`}
				className={cn(
					"relative flex shrink-0 cursor-default select-none items-center gap-3 px-3",
					dark ? "h-9" : "h-8 border-b",
				)}
				role="toolbar"
				onDoubleClick={onMaximize}
				onLostPointerCapture={end}
				onPointerDown={(event) => start("move", event)}
				onPointerMove={move}
			>
				<div className="flex items-center gap-1.5">
					<button
						aria-label="Close window"
						className="size-3 rounded-full bg-[#FF5F57] hover:brightness-90"
						onClick={onClose}
						onPointerDown={(event) => event.stopPropagation()}
						type="button"
					/>
					<span className="size-3 rounded-full bg-[#FEBC2E]" />
					<button
						aria-label={maximized ? "Restore window" : "Maximize window"}
						className="size-3 rounded-full bg-[#28C840] hover:brightness-90"
						onClick={onMaximize}
						onPointerDown={(event) => event.stopPropagation()}
						type="button"
					/>
				</div>
				<span
					className={cn(
						"pointer-events-none text-xs",
						dark
							? "font-mono text-[#CECDC3]"
							: "absolute inset-x-0 text-center text-muted-foreground",
					)}
				>
					{title}
				</span>
				{remote ? <User.Stack className="relative ml-auto" size="xs" users={[remote]} /> : null}
			</div>
			<div className="min-h-0 grow">{children}</div>
			{maximized
				? null
				: edges.map(({ edge, className }) => (
						<button
							aria-label={`Resize ${edge}`}
							className={cn("absolute z-10 touch-none", className)}
							key={edge}
							onLostPointerCapture={end}
							onPointerDown={(event) => start(edge, event)}
							onPointerMove={move}
							tabIndex={-1}
							type="button"
						/>
					))}
		</section>
	);
}
