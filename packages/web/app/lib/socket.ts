export function socket(args: {
	open: () => WebSocket;
	onMessage: (data: unknown) => void;
	onOpen?: () => void;
	onReconnect?: () => void;
	onClose?: () => void;
}) {
	let ws: WebSocket | undefined;
	let attempt = 0;
	let opened = false;
	let closed = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function connect() {
		ws = args.open();
		ws.onopen = () => {
			attempt = 0;
			args.onOpen?.();
			if (opened) args.onReconnect?.();
			opened = true;
		};
		ws.onmessage = (event) => args.onMessage(event.data);
		ws.onclose = () => {
			args.onClose?.();
			if (closed) return;
			const delay = Math.min(10_000, 500 * 2 ** attempt++);
			timer = setTimeout(connect, delay / 2 + Math.random() * (delay / 2));
		};
	}

	connect();

	return {
		send(data: string) {
			if (ws?.readyState === WebSocket.OPEN) ws.send(data);
		},
		close() {
			closed = true;
			clearTimeout(timer);
			ws?.close();
		},
	};
}
