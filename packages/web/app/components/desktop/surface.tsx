import type { Presence, Workspace as WorkspaceModel } from "@tomo/api";
import { type PointerEvent, useState } from "react";
import { Workspace } from "~/components/workspace";
import { cn } from "~/lib/utils";
import { Dock } from "./dock";
import { Terminal } from "./terminal";
import { type Frame, Window } from "./window";

type Open = { id: number; frame: Frame; maximized: boolean; z: number };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function Surface({
	workspace,
	cursors,
	onMove,
	className,
}: {
	workspace: Pick<WorkspaceModel.Select, "id" | "wallpaper">;
	cursors: Presence.Cursor[];
	onMove: (point: Presence.Point | null) => void;
	className?: string;
}) {
	const [windows, setWindows] = useState<Open[]>([
		{ id: 0, frame: { x: 0.08, y: 0.1, w: 0.5, h: 0.55 }, maximized: false, z: 1 },
	]);

	const top = () => Math.max(0, ...windows.map((open) => open.z)) + 1;
	const update = (id: number, change: Partial<Open>) =>
		setWindows((all) => all.map((open) => (open.id === id ? { ...open, ...change } : open)));

	function launch() {
		const id = Math.max(-1, ...windows.map((open) => open.id)) + 1;
		const offset = (windows.length % 6) * 0.03;
		setWindows((all) => [
			...all,
			{
				id,
				frame: { x: 0.1 + offset, y: 0.12 + offset, w: 0.5, h: 0.55 },
				maximized: false,
				z: top(),
			},
		]);
	}

	function track(event: PointerEvent<HTMLDivElement>) {
		const rect = event.currentTarget.getBoundingClientRect();
		onMove({
			x: clamp((event.clientX - rect.left) / rect.width),
			y: clamp((event.clientY - rect.top) / rect.height),
		});
	}

	return (
		<div
			className={cn("relative isolate overflow-hidden bg-muted", className)}
			data-surface
			onPointerLeave={() => onMove(null)}
			onPointerMove={track}
		>
			<Workspace.Wallpaper.Image
				className="absolute inset-0 -z-10"
				wallpaper={workspace.wallpaper}
			/>
			{windows.map((open) => (
				<Window
					frame={open.frame}
					key={open.id}
					maximized={open.maximized}
					onClose={() => setWindows((all) => all.filter((other) => other.id !== open.id))}
					onFocus={() => {
						if (open.z !== top() - 1) update(open.id, { z: top() });
					}}
					onMaximize={() => update(open.id, { maximized: !open.maximized })}
					onMove={(frame) => update(open.id, { frame })}
					title="Terminal"
					z={open.z}
				>
					<Terminal workspaceId={workspace.id} />
				</Window>
			))}
			<div className="absolute inset-x-0 bottom-3 z-[1000] flex justify-center">
				<Dock onTerminal={launch} />
			</div>
			<Workspace.Cursors.Root className="absolute inset-0 z-[1001]" cursors={cursors} />
		</div>
	);
}
