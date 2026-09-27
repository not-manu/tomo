import { Separator } from "~/components/ui/separator";
import { Danger } from "../danger";
import type { Detail } from "../header/root";
import { Usage } from "../usage";
import { Wallpaper } from "../wallpaper";
import { Group } from "./group";
import { Name } from "./name";

export function Root({ workspace }: { workspace: Detail }) {
	const owner = workspace.role === "owner";

	return (
		<div className="flex flex-col gap-10">
			<Group description="How this workspace shows up for everyone in it." title="Name">
				{owner ? <Name workspace={workspace} /> : <p className="text-sm">{workspace.name}</p>}
			</Group>
			<Separator />
			<Group
				description={
					owner
						? "Pick a photo for the desktop. Everyone sees the same one."
						: "Only the owner can change the desktop photo."
				}
				title="Wallpaper"
			>
				<Wallpaper.Picker readOnly={!owner} workspace={workspace} />
			</Group>
			<Separator />
			<Group
				description="What this workspace's computer is using right now, against its plan's limits."
				title="Resources"
			>
				<Usage.Root workspace={workspace} />
			</Group>
			<Separator />
			<Group
				description={
					owner
						? "Deleting removes the files and sandbox for everyone. There is no undo."
						: "You'll need a new invite to come back."
				}
				title="Danger zone"
			>
				<div>
					<Danger.Button workspace={workspace} />
				</div>
			</Group>
		</div>
	);
}
