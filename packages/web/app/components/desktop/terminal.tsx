import "@xterm/xterm/css/xterm.css";
import { Terminal as TerminalModel } from "@tomo/api";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal as XTerm } from "@xterm/xterm";
import { useEffect, useEffectEvent, useRef } from "react";
import { useLive, useLiveEvent } from "~/hooks/use-live";

const BaseFont = 13;

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
	const exited = useRef(false);
	const queue = useRef("");
	const frame = useRef<number>(undefined);

	function cell() {
		const xterm = term.current;
		const screen = xterm?.element?.querySelector(".xterm-screen")?.getBoundingClientRect();
		if (!xterm || !screen?.width || !screen.height) return undefined;
		const ratio = BaseFont / (xterm.options.fontSize ?? BaseFont);
		return { w: (screen.width / xterm.cols) * ratio, h: (screen.height / xterm.rows) * ratio };
	}

	function size(): TerminalModel.Size {
		const base = cell();
		const box = container.current;
		if (!base || !box?.clientWidth || !box.clientHeight) return { cols: 80, rows: 24 };
		return {
			cols: Math.min(500, Math.max(2, Math.floor(box.clientWidth / base.w))),
			rows: Math.min(200, Math.max(2, Math.floor(box.clientHeight / base.h))),
		};
	}

	function scale() {
		const xterm = term.current;
		const base = cell();
		const box = container.current;
		if (!xterm || !base || !box?.clientWidth || !box.clientHeight) return;
		const factor = Math.min(
			box.clientWidth / (xterm.cols * base.w),
			box.clientHeight / (xterm.rows * base.h),
		);
		let next = Math.min(32, Math.max(8, Math.floor(BaseFont * factor * 4) / 4));
		if (next === xterm.options.fontSize) return;
		xterm.options.fontSize = next;
		for (let step = 0; step < 8 && next > 8; step++) {
			const screen = xterm.element?.querySelector(".xterm-screen")?.getBoundingClientRect();
			if (!screen || (screen.width <= box.clientWidth && screen.height <= box.clientHeight)) return;
			next -= 0.25;
			xterm.options.fontSize = next;
		}
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
			fontSize: BaseFont,
			lineHeight: 1.25,
			cursorStyle: "block",
			cursorBlink: true,
			scrollback: 2000,
		});
		xterm.open(container.current);
		try {
			const webgl = new WebglAddon(true);
			webgl.onContextLoss(() => webgl.dispose());
			xterm.loadAddon(webgl);
		} catch {}
		term.current = xterm;
		xterm.focus();
		return () => {
			if (frame.current) cancelAnimationFrame(frame.current);
			xterm.dispose();
			term.current = undefined;
		};
	}, []);

	const onData = useEffectEvent((data: string) => {
		if (exited.current) return attach();
		live.send(TerminalModel.Events.input, { windowId, data });
	});
	const onConnect = useEffectEvent(attach);
	const onResize = useEffectEvent(() => {
		scale();
		return size();
	});
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
		scale();
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
		scale();
	});

	useLiveEvent(TerminalModel.Events.exit, (event) => {
		if (event.windowId !== windowId) return;
		exited.current = true;
		drain();
		term.current?.write("\r\n\x1b[2m[process exited — press any key to restart]\x1b[0m\r\n");
	});

	return (
		<div className="relative size-full overflow-hidden bg-[#100F0F] px-3 pt-1 pb-3 [&_.xterm-viewport]:[scrollbar-width:none]">
			<div className="size-full" ref={container} />
		</div>
	);
}
