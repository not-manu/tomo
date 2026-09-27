export namespace Preview {
	export const DefaultAddress = "localhost:5173";

	export type Target = { workspaceId: string; port: number };
	export type Address = { port: number; path: string };

	const Host = /^(\d{1,5})-((?:[0-9a-f]{2})+)\./;
	const Input = /^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0)?:?(\d{1,5})(\/.*)?$/i;

	function valid(port: number) {
		return Number.isInteger(port) && port > 0 && port < 65536;
	}

	export function label(target: Target) {
		const hex = [...target.workspaceId]
			.map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
			.join("");
		return `${target.port}-${hex}`;
	}

	export function parse(host: string): Target | undefined {
		const match = Host.exec(host.toLowerCase());
		if (!match?.[1] || !match[2]) return undefined;
		const port = Number(match[1]);
		if (!valid(port)) return undefined;
		const workspaceId = (match[2].match(/../g) ?? [])
			.map((pair) => String.fromCharCode(Number.parseInt(pair, 16)))
			.join("");
		return /^[\w-]+$/.test(workspaceId) ? { workspaceId, port } : undefined;
	}

	export function address(input: string): Address | undefined {
		const match = Input.exec(input.trim());
		if (!match?.[1]) return undefined;
		const port = Number(match[1]);
		return valid(port) ? { port, path: match[2] ?? "/" } : undefined;
	}

	export function format(address: Address) {
		return `localhost:${address.port}${address.path === "/" ? "" : address.path}`;
	}
}
