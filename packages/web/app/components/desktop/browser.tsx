import { Core, Preview } from "@tomo/api";
import { ExternalLink, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

function origin(workspaceId: string, port: number) {
	const { protocol, host, hostname } = window.location;
	const base = hostname === "localhost" ? `localhost:${Core.Ports.Api}` : host;
	return `${protocol}//${Preview.label({ workspaceId, port })}.${base}`;
}

const control =
	"flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground";

export function Browser({
	workspaceId,
	address,
	onNavigate,
}: {
	workspaceId: string;
	address: string;
	onNavigate: (address: string) => void;
}) {
	const [draft, setDraft] = useState(address);
	const [reloads, setReloads] = useState(0);
	const target = Preview.address(address);
	const src = target ? `${origin(workspaceId, target.port)}${target.path}` : undefined;

	useEffect(() => setDraft(address), [address]);

	return (
		<div className="flex size-full flex-col bg-background text-foreground">
			<form
				className="flex h-10 shrink-0 items-center gap-1 border-b px-2"
				onSubmit={(event) => {
					event.preventDefault();
					const next = Preview.address(draft);
					if (!next) return setDraft(address);
					const formatted = Preview.format(next);
					if (formatted === address) setReloads((count) => count + 1);
					else onNavigate(formatted);
				}}
			>
				<button
					aria-label="Reload"
					className={control}
					onClick={() => setReloads((count) => count + 1)}
					type="button"
				>
					<RotateCw className="size-3.5" />
				</button>
				<input
					aria-label="Address"
					className="h-7 min-w-0 grow rounded-md bg-muted px-2.5 text-center font-mono text-xs outline-none transition focus:bg-background focus:text-left focus:ring-2 focus:ring-blue-500/60"
					onBlur={() => setDraft(address)}
					onChange={(event) => setDraft(event.target.value)}
					onFocus={(event) => event.target.select()}
					placeholder={Preview.DefaultAddress}
					spellCheck={false}
					value={draft}
				/>
				<a
					aria-label="Open in new tab"
					className={control}
					href={src}
					rel="noreferrer"
					target="_blank"
				>
					<ExternalLink className="size-3.5" />
				</a>
			</form>
			{src ? (
				<iframe
					allow="clipboard-read; clipboard-write; fullscreen"
					className="min-h-0 grow bg-white"
					key={`${src}#${reloads}`}
					src={src}
					title={address}
				/>
			) : (
				<p className="m-auto text-muted-foreground text-sm">Enter a port, like 5173</p>
			)}
		</div>
	);
}
