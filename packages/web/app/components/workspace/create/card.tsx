import { Plus } from "lucide-react";
import { Root } from "./root";

export function Card() {
	return (
		<Root>
			<button
				className="group flex w-full flex-col gap-2 rounded-2xl text-left focus-visible:outline-none"
				type="button"
			>
				<span className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed text-muted-foreground transition group-hover:bg-muted group-hover:text-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring">
					<Plus className="size-6" />
				</span>
				<span className="flex flex-col px-1">
					<span className="font-medium text-sm">New workspace</span>
					<span className="text-muted-foreground text-xs">One computer for your team</span>
				</span>
			</button>
		</Root>
	);
}
