import "@xterm/xterm/css/xterm.css";
import { type Presence, Terminal as TerminalModel } from "@tomo/api";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal as XTerm } from "@xterm/xterm";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { User } from "~/components/user";
import { useLive, useLiveEvent } from "~/hooks/use-live";

const theme = {
	background: "#100F0F",
	foreground: "#CECDC3",
	cursor: "#CECDC3",
	selectionBackground: "#403E3C",
	black: "#100F0F",
	red: "#D14D41",
	green: "#879A39",
	yellow: "#D0A215",
	blue: "#4385BE",
	magenta: "#CE5D97",
	cyan: "#3AA99F",
	white: "#CECDC3",
	brightBlack: "#575653",
	brightRed: "#D14D41",
	brightGreen: "#879A39",
	brightYellow: "#D0A215",
	brightBlue: "#4385BE",
	brightMagenta: "#CE5D97",
	brightCyan: "#3AA99F",
	brightWhite: "#FFFCF0",
};

export function Terminal({ windowId }: { windowId: string }) {
	const live = useLive();
	const container = useRef<HTMLDivElement>(null);
	const term = useRef<XTerm>(undefined);
	const fit = useRef<FitAddon>(undefined);
	const exited = useRef(false);
	const queue = useRef("");
	const frame = useRef<number>(undefined);
	const [typing, setTyping] = useState<Presence.User | null>(null);
	const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	function size(): TerminalModel.Size {
		const proposed = fit.current?.proposeDimensions();
		if (!proposed?.cols || !proposed.rows) return { cols: 80, rows: 24 };
		return {
			cols: Math.min(500, Math.max(2, proposed.cols)),
			rows: Math.min(200, Math.max(2, proposed.rows)),
		};
	}

	function drain() {
		if (frame.current) cancelAnimationFrame(frame.current);
		frame.current = undefined;
		if (queue.current) term.current?.write(queue.current);
		queue.current = "";
	}

	function attach() {
		exited.current = false;
		live.send(TerminalModel.Events.attach, { windowId, size: size() });
	}

	useEffect(() => {
		if (!container.current) return;
		const xterm = new XTerm({
			theme,
			fontFamily: '"Berkeley Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
			fontSize: 13,
			lineHeight: 1.25,
			cursorStyle: "block",
			cursorBlink: true,
			scrollback: 2000,
		});
		const addon = new FitAddon();
		xterm.loadAddon(addon);
		xterm.open(container.current);
		try {
			const webgl = new WebglAddon();
			webgl.onContextLoss(() => webgl.dispose());
			xterm.loadAddon(webgl);
		} catch {}
		term.current = xterm;
		fit.current = addon;
		xterm.focus();
		return () => {
			if (frame.current) cancelAnimationFrame(frame.current);
			xterm.dispose();
			term.current = undefined;
			fit.current = undefined;
		};
	}, []);

	const onData = useEffectEvent((data: string) => {
		if (exited.current) return attach();
		live.send(TerminalModel.Events.input, { windowId, data });
	});
	const onConnect = useEffectEvent(attach);
	const onResize = useEffectEvent(() => size());
	const send = live.send;

	useEffect(() => {
		const disposable = term.current?.onData(onData);
		return () => disposable?.dispose();
	}, []);

	useEffect(() => {
		if (!live.connection) return;
		onConnect();
		return () => send(TerminalModel.Events.detach, { windowId });
	}, [live.connection, send, windowId]);

	useEffect(() => {
		const element = container.current;
		if (!element) return;
		let last = "";
		const observer = new ResizeObserver(() => {
			const next = onResize();
			const key = `${next.cols}x${next.rows}`;
			if (key === last) return;
			last = key;
			send(TerminalModel.Events.resize, { windowId, size: next });
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [send, windowId]);

	useLiveEvent(TerminalModel.Events.snapshot, (event) => {
		if (event.windowId !== windowId) return;
		queue.current = "";
		term.current?.reset();
		term.current?.resize(event.size.cols, event.size.rows);
		term.current?.write(event.data);
	});

	useLiveEvent(TerminalModel.Events.output, (event) => {
		if (event.windowId !== windowId) return;
		queue.current += event.data;
		frame.current ??= requestAnimationFrame(drain);
	});

	useLiveEvent(TerminalModel.Events.size, (event) => {
		if (event.windowId !== windowId) return;
		drain();
		term.current?.resize(event.size.cols, event.size.rows);
	});

	useLiveEvent(TerminalModel.Events.exit, (event) => {
		if (event.windowId !== windowId) return;
		exited.current = true;
		drain();
		term.current?.write("\r\n\x1b[2m[process exited — press any key to restart]\x1b[0m\r\n");
	});

	useLiveEvent(TerminalModel.Events.typing, (event) => {
		if (event.windowId !== windowId) return;
		setTyping(event.user);
		clearTimeout(typingTimer.current);
		typingTimer.current = setTimeout(() => setTyping(null), 1500);
	});

	useEffect(() => () => clearTimeout(typingTimer.current), []);

	return (
		<div className="relative size-full overflow-hidden bg-[#100F0F] px-3 pt-1 pb-3 [&_.xterm-viewport]:[scrollbar-width:none]">
			<div className="size-full" ref={container} />
			{typing ? (
				<div className="pointer-events-none absolute top-2 right-3 flex items-center gap-1.5 rounded-full bg-white/10 py-0.5 pr-2.5 pl-0.5 text-[11px] text-neutral-200 backdrop-blur">
					<User.Stack size="xs" users={[typing]} />
					{typing.name.split(" ")[0]} is typing
				</div>
			) : null}
		</div>
	);
}
