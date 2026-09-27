import { DesktopWindow, type Presence, type Workspace as WorkspaceModel } from "@tomo/api";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { Workspace } from "~/components/workspace";
import { useLive, useLiveEvent } from "~/hooks/use-live";
import { useCreateWindow, useRemoveWindow, useUpdateWindow, useWindows } from "~/hooks/use-windows";
import { cn } from "~/lib/utils";
import { Dock } from "./dock";
import { Terminal } from "./terminal";
import { type Frame, Window } from "./window";

type Remote = { frame: Frame; user: Presence.User };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function Surface({
	workspace,
	desktopId,
	cursors,
	onMove,
	className,
}: {
	workspace: Pick<WorkspaceModel.Select, "id" | "wallpaper">;
	desktopId: string;
	cursors: Presence.Cursor[];
	onMove: (point: Presence.Point | null) => void;
	className?: string;
}) {
	const live = useLive();
	const { data: all = [] } = useWindows(workspace.id);
	const create = useCreateWindow(workspace.id);
	const update = useUpdateWindow(workspace.id);
	const remove = useRemoveWindow(workspace.id);
	const [local, setLocal] = useState<{ id: string; frame: Frame } | null>(null);
	const [remote, setRemote] = useState<Record<string, Remote>>({});
	const expiry = useRef(new Map<string, ReturnType<typeof setTimeout>>());
	const frame = useRef<number>(undefined);
	const outgoing = useRef<{ windowId: string; frame: Frame } | null>(null);

	const windows = all.filter((window) => window.desktopId === desktopId);
	const top = Math.max(0, ...windows.map((window) => window.z));

	useLiveEvent(DesktopWindow.Events.dragged, ({ windowId, frame, user }) => {
		setRemote((current) => ({ ...current, [windowId]: { frame, user } }));
		clearTimeout(expiry.current.get(windowId));
		expiry.current.set(
			windowId,
			setTimeout(() => {
				expiry.current.delete(windowId);
				setRemote(({ [windowId]: _, ...rest }) => rest);
			}, 800),
		);
	});

	useEffect(() => {
		const timers = expiry.current;
		return () => {
			for (const timer of timers.values()) clearTimeout(timer);
			if (frame.current) cancelAnimationFrame(frame.current);
		};
	}, []);

	function drag(windowId: string, next: Frame) {
		setLocal({ id: windowId, frame: next });
		outgoing.current = { windowId, frame: next };
		frame.current ??= requestAnimationFrame(() => {
			frame.current = undefined;
			if (outgoing.current) live.send(DesktopWindow.Events.drag, outgoing.current);
		});
	}

	function drop(windowId: string, next: Frame) {
		update.mutate({ windowId, frame: next }, { onSettled: () => setLocal(null) });
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
			{windows.map((window) => {
				const other = remote[window.id];
				const current =
					local?.id === window.id ? local.frame : (other?.frame ?? DesktopWindow.frame(window));
				return (
					<Window
						frame={current}
						key={window.id}
						maximized={window.maximized}
						onClose={() => remove.mutate(window.id)}
						onDrop={(next) => drop(window.id, next)}
						onFocus={() => {
							if (window.z !== top) update.mutate({ windowId: window.id, focus: true });
						}}
						onMaximize={() => update.mutate({ windowId: window.id, maximized: !window.maximized })}
						onMove={(next) => drag(window.id, next)}
						remote={local?.id === window.id ? undefined : other?.user}
						title="Terminal"
						z={window.z}
					>
						<Terminal windowId={window.id} />
					</Window>
				);
			})}
			<div className="absolute inset-x-0 bottom-3 z-[1000] flex justify-center">
				<Dock onTerminal={() => create.mutate({ desktopId, app: "terminal" })} />
			</div>
			<Workspace.Cursors.Root className="absolute inset-0 z-[1001]" cursors={cursors} />
		</div>
	);
}
