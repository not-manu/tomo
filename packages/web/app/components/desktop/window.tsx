import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";
import { cn } from "~/lib/utils";

export type Frame = { x: number; y: number; w: number; h: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function Window({
	title,
	frame,
	maximized,
	z,
	onMove,
	onFocus,
	onClose,
	onMaximize,
	children,
}: {
	title: string;
	frame: Frame;
	maximized: boolean;
	z: number;
	onMove: (frame: Frame) => void;
	onFocus: () => void;
	onClose: () => void;
	onMaximize: () => void;
	children: ReactNode;
}) {
	const drag = useRef<{ x: number; y: number; frame: Frame; width: number; height: number }>(
		undefined,
	);

	function start(event: PointerEvent<HTMLDivElement>) {
		if (maximized || event.button !== 0) return;
		const surface = event.currentTarget.closest("[data-surface]")?.getBoundingClientRect();
		if (!surface) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		drag.current = {
			x: event.clientX,
			y: event.clientY,
			frame,
			width: surface.width,
			height: surface.height,
		};
	}

	function move(event: PointerEvent<HTMLDivElement>) {
		const current = drag.current;
		if (!current) return;
		onMove({
			...current.frame,
			x: clamp(
				current.frame.x + (event.clientX - current.x) / current.width,
				0,
				1 - current.frame.w,
			),
			y: clamp(
				current.frame.y + (event.clientY - current.y) / current.height,
				0,
				1 - current.frame.h,
			),
		});
	}

	return (
		<section
			aria-label={title}
			className={cn(
				"absolute flex flex-col overflow-hidden border bg-background/95 shadow-2xl backdrop-blur-xl",
				maximized ? "inset-0 rounded-none" : "rounded-xl",
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
				className="relative flex h-8 shrink-0 cursor-default select-none items-center border-b px-3"
				role="toolbar"
				onDoubleClick={onMaximize}
				onLostPointerCapture={() => {
					drag.current = undefined;
				}}
				onPointerDown={start}
				onPointerMove={move}
			>
				<div className="flex items-center gap-1.5">
					<button
						aria-label="Close window"
						className="size-3 rounded-full bg-red-400 hover:bg-red-500"
						onClick={onClose}
						onPointerDown={(event) => event.stopPropagation()}
						type="button"
					/>
					<span className="size-3 rounded-full bg-yellow-400" />
					<button
						aria-label={maximized ? "Restore window" : "Maximize window"}
						className="size-3 rounded-full bg-green-400 hover:bg-green-500"
						onClick={onMaximize}
						onPointerDown={(event) => event.stopPropagation()}
						type="button"
					/>
				</div>
				<span className="pointer-events-none absolute inset-x-0 text-center text-muted-foreground text-xs">
					{title}
				</span>
			</div>
			<div className="min-h-0 grow">{children}</div>
		</section>
	);
}
