import { Sandbox } from "@tomo/api";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { errorMessage, hono } from "~/lib/hono";

type Entry = { id: number; cwd: string; cmd: string; stdout: string; stderr: string; code: number };

const MARK = "\u001e";

function display(cwd: string) {
	return cwd === "/" ? "~" : `~${cwd}`;
}

function parse(stdout: string, fallback: string) {
	const at = stdout.lastIndexOf(MARK);
	if (at === -1) return { stdout, cwd: fallback };
	const pwd = stdout.slice(at + MARK.length).trim();
	const cwd = pwd.startsWith(Sandbox.Mount) ? pwd.slice(Sandbox.Mount.length) || "/" : fallback;
	return { stdout: stdout.slice(0, at), cwd };
}

export function Terminal({ workspaceId }: { workspaceId: string }) {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [cwd, setCwd] = useState("/");
	const [running, setRunning] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	const bottom = useRef<HTMLDivElement>(null);
	const next = useRef(0);

	useEffect(() => {
		input.current?.focus();
	}, []);

	useEffect(() => {
		bottom.current?.scrollIntoView({ block: "end" });
	});

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const cmd = input.current?.value.trim() ?? "";
		if (!cmd || running) return;
		if (input.current) input.current.value = "";
		if (cmd === "clear") return setEntries([]);
		setRunning(true);
		const id = next.current++;
		try {
			const response = await hono.api.workspace[":id"].run.$post({
				param: { id: workspaceId },
				json: { cmd: `${cmd}\nprintf '${MARK}%s' "$PWD"`, cwd },
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			const result = await response.json();
			const parsed = parse(result.stdout, cwd);
			setEntries((all) => [
				...all,
				{ id, cwd, cmd, stdout: parsed.stdout, stderr: result.stderr, code: result.exitCode },
			]);
			setCwd(parsed.cwd);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Something went wrong.";
			setEntries((all) => [...all, { id, cwd, cmd, stdout: "", stderr: message, code: 1 }]);
		} finally {
			setRunning(false);
			input.current?.focus();
		}
	}

	return (
		<div
			className="flex h-full flex-col overflow-y-auto bg-neutral-950 p-3 font-mono text-[12px] text-neutral-100 leading-relaxed"
			onPointerUp={() => {
				if (!window.getSelection()?.toString()) input.current?.focus();
			}}
		>
			{entries.map((entry) => (
				<div key={entry.id} className="whitespace-pre-wrap break-words">
					<div>
						<span className="text-blue-400">{display(entry.cwd)}</span>{" "}
						<span className="text-neutral-500">$</span> {entry.cmd}
					</div>
					{entry.stdout ? <div>{entry.stdout.replace(/\n$/, "")}</div> : null}
					{entry.stderr ? (
						<div className="text-red-400">{entry.stderr.replace(/\n$/, "")}</div>
					) : null}
				</div>
			))}
			<form className="flex items-center gap-2" onSubmit={submit}>
				<span className="shrink-0">
					<span className="text-blue-400">{display(cwd)}</span>{" "}
					<span className="text-neutral-500">$</span>
				</span>
				<input
					aria-label="Command"
					autoCapitalize="off"
					autoComplete="off"
					className="min-w-0 grow bg-transparent outline-none disabled:opacity-50"
					disabled={running}
					ref={input}
					spellCheck={false}
				/>
			</form>
			<div ref={bottom} />
		</div>
	);
}
