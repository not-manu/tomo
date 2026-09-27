import { type Presence, Workspace } from "@tomo/api";
import { ArrowUpRight } from "lucide-react";
import { Tomo } from "~/components/tomo";
import { Button } from "~/components/ui/button";
import { User } from "~/components/user";
import { cn } from "~/lib/utils";
import { Image } from "../wallpaper/image";

function status(count: number) {
	if (count === 0) return "No one's here yet";
	if (count === 1) return "1 person is working";
	return `${count} people are working`;
}

export function Root({
	workspace,
	className,
}: {
	workspace: Pick<Workspace.Select, "id" | "wallpaper"> & { online: Presence.User[] };
	className?: string;
}) {
	return (
		<div className={cn("relative isolate overflow-hidden bg-muted", className)}>
			<Image
				className="absolute inset-0 -z-10 scale-110 blur-2xl"
				wallpaper={workspace.wallpaper}
			/>
			<div className="absolute inset-0 -z-10 bg-black/20" />
			<div className="flex size-full flex-col items-center justify-center gap-5 p-6 text-center">
				<User.Stack max={5} size="lg" users={workspace.online} />
				<span className="font-medium text-sm text-white drop-shadow-sm">
					{status(workspace.online.length)}
				</span>
				<Button asChild size="lg" variant="secondary">
					<Tomo.Link rel="noopener" target="_blank" to={Workspace.desktopPath(workspace)}>
						{workspace.online.length > 0 ? "Join them" : "Open desktop"}
						<ArrowUpRight />
					</Tomo.Link>
				</Button>
			</div>
		</div>
	);
}
