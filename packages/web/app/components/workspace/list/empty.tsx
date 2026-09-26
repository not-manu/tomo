import { LayoutGrid } from "lucide-react";
import {
	Empty as EmptyRoot,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/components/ui/empty";
import { Create } from "../create";

export function Empty() {
	return (
		<EmptyRoot className="border">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<LayoutGrid />
				</EmptyMedia>
				<EmptyTitle>No workspaces yet</EmptyTitle>
				<EmptyDescription>
					A workspace is one computer for your team and its agents. Create one to get started.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Create.Root />
			</EmptyContent>
		</EmptyRoot>
	);
}
