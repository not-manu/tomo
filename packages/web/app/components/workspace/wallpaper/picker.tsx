import { Workspace } from "@tomo/api";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useUpdateWorkspace } from "~/hooks/use-workspace";
import { cn } from "~/lib/utils";
import { Image } from "./image";

export function Picker({
	workspace,
	readOnly = false,
}: {
	workspace: Pick<Workspace.Select, "id" | "wallpaper">;
	readOnly?: boolean;
}) {
	const update = useUpdateWorkspace(workspace.id);

	async function pick(wallpaper: Workspace.Wallpaper) {
		if (wallpaper === workspace.wallpaper) return;
		try {
			await update.mutateAsync({ wallpaper });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{Workspace.Wallpaper.options.map((key) => {
				const painting = Workspace.Wallpapers[key];
				const selected = key === workspace.wallpaper;
				return (
					<li key={key}>
						<button
							aria-pressed={selected}
							className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
							disabled={readOnly || update.isPending}
							onClick={() => pick(key)}
							type="button"
						>
							<span
								className={cn(
									"relative block aspect-video w-full overflow-hidden rounded-xl border bg-muted transition",
									selected
										? "ring-2 ring-ring ring-offset-2 ring-offset-background"
										: "group-hover:opacity-90",
								)}
							>
								<Image className="absolute inset-0" wallpaper={key} />
								{selected ? (
									<span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
										<Check className="size-3" />
									</span>
								) : null}
							</span>
							<span className="flex flex-col px-0.5">
								<span className="truncate font-medium text-sm">{painting.title}</span>
								<span className="truncate text-muted-foreground text-xs">
									{[painting.artist, painting.year].filter(Boolean).join(", ") || "Photograph"}
								</span>
							</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}
