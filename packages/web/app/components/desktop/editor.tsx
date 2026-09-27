import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { Compartment } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { Document, Sync } from "@tomo/api";
import { basicSetup } from "codemirror";
import { useEffect, useRef, useState } from "react";
import { yCollab } from "y-codemirror.next";
import {
	Awareness,
	applyAwarenessUpdate,
	encodeAwarenessUpdate,
	removeAwarenessStates,
} from "y-protocols/awareness";
import * as Y from "yjs";
import { useTheme } from "~/components/theme/provider";
import { basename } from "~/hooks/use-files";
import { useLive } from "~/hooks/use-live";
import { useSession } from "~/lib/auth";

const colors = [
	"#D14D41",
	"#DA702C",
	"#D0A215",
	"#879A39",
	"#3AA99F",
	"#4385BE",
	"#8B7EC8",
	"#CE5D97",
];

function color(id: string) {
	let hash = 0;
	for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
	return colors[Math.abs(hash) % colors.length] ?? "#4385BE";
}

const base = EditorView.theme({
	"&": { height: "100%", fontSize: "13px" },
	".cm-scroller": {
		fontFamily: '"Berkeley Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
		lineHeight: "1.5",
	},
	"&.cm-focused": { outline: "none" },
});

export function Editor({ path }: { path: string }) {
	const { connection, send, listen } = useLive();
	const { resolved } = useTheme();
	const { data: session } = useSession();
	const container = useRef<HTMLDivElement>(null);
	const view = useRef<EditorView>(undefined);
	const theme = useRef(new Compartment());
	const [error, setError] = useState<string | null>(null);
	const dark = resolved === "dark";
	const user = session?.user;

	useEffect(() => {
		if (!connection || !container.current) return;
		setError(null);
		const doc = new Y.Doc();
		const text = doc.getText(Document.Field);
		const awareness = new Awareness(doc);
		const tint = color(user?.id ?? String(doc.clientID));
		awareness.setLocalStateField("user", {
			name: user?.name ?? "Someone",
			color: tint,
			colorLight: `${tint}33`,
		});
		const language = new Compartment();

		doc.on("update", (update: Uint8Array, origin: unknown) => {
			if (origin !== "remote")
				send(Document.Events.update, { path, update: Document.encode(update) });
		});
		awareness.on(
			"update",
			(changes: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
				if (origin === "remote") return;
				const clients = [...changes.added, ...changes.updated, ...changes.removed];
				send(Document.Events.awareness, {
					path,
					update: Document.encode(encodeAwarenessUpdate(awareness, clients)),
				});
			},
		);

		const stop = listen((message) => {
			const state =
				Sync.decode(Document.Events.state, message) ?? Sync.decode(Document.Events.update, message);
			if (state?.path === path) Y.applyUpdate(doc, Document.decode(state.update), "remote");
			const presence = Sync.decode(Document.Events.awareness, message);
			if (presence?.path === path) {
				applyAwarenessUpdate(awareness, Document.decode(presence.update), "remote");
			}
			const failure = Sync.decode(Document.Events.error, message);
			if (failure?.path === path) setError(failure.message);
		});

		const editor = new EditorView({
			parent: container.current,
			extensions: [
				basicSetup,
				base,
				EditorView.lineWrapping,
				language.of([]),
				theme.current.of(document.documentElement.classList.contains("dark") ? oneDark : []),
				yCollab(text, awareness),
			],
		});
		view.current = editor;
		LanguageDescription.matchFilename(languages, basename(path))
			?.load()
			.then((support) => editor.dispatch({ effects: language.reconfigure(support) }))
			.catch(() => undefined);

		send(Document.Events.open, { path });

		return () => {
			removeAwarenessStates(awareness, [doc.clientID], "local");
			send(Document.Events.close, { path });
			stop();
			editor.destroy();
			view.current = undefined;
			awareness.destroy();
			doc.destroy();
		};
	}, [connection, send, listen, path, user?.id, user?.name]);

	useEffect(() => {
		view.current?.dispatch({ effects: theme.current.reconfigure(dark ? oneDark : []) });
	}, [dark]);

	return (
		<div className="relative size-full overflow-hidden bg-background">
			<div className="size-full" ref={container} />
			{error ? (
				<div className="absolute inset-0 flex items-center justify-center bg-background text-muted-foreground text-sm">
					{error}
				</div>
			) : null}
		</div>
	);
}
