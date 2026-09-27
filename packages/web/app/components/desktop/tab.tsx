import type { Presence } from "@tomo/api";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { User } from "~/components/user";
import { cn } from "~/lib/utils";

export function Tab({
	name,
	active,
	viewers,
	removable,
	onSelect,
	onRename,
	onRemove,
}: {
	name: string;
	active: boolean;
	viewers: Presence.User[];
	removable: boolean;
	onSelect: () => void;
	onRename: (name: string) => void;
	onRemove: () => void;
}) {
	const [editing, setEditing] = useState(false);
	const select = useCallback((element: HTMLInputElement | null) => element?.select(), []);

	function commit(value: string) {
		setEditing(false);
		const next = value.trim();
		if (next && next !== name) onRename(next);
	}

	return (
		<div
			className={cn(
				"group relative flex h-9 min-w-36 max-w-56 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm transition",
				active
					? "border-border bg-secondary text-secondary-foreground shadow-sm"
					: "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{editing ? (
				<input
					ref={select}
					className="min-w-0 grow bg-transparent outline-none"
					defaultValue={name}
					maxLength={40}
					onBlur={(event) => commit(event.currentTarget.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") commit(event.currentTarget.value);
						if (event.key === "Escape") setEditing(false);
					}}
				/>
			) : (
				<button
					className="min-w-0 grow truncate text-left outline-none after:absolute after:inset-0"
					onClick={onSelect}
					onDoubleClick={() => setEditing(true)}
					type="button"
				>
					{name}
				</button>
			)}
			<User.Stack className="relative" max={3} size="xs" users={viewers} />
			{removable && !editing ? (
				<button
					aria-label={`Close ${name}`}
					className="relative -mr-1 hidden size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground group-hover:flex"
					onClick={onRemove}
					type="button"
				>
					<X className="size-3.5" />
				</button>
			) : null}
		</div>
	);
}
