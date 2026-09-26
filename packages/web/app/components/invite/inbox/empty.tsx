import { Inbox } from "lucide-react";
import {
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	Empty as EmptyRoot,
	EmptyTitle,
} from "~/components/ui/empty";

export function Empty() {
	return (
		<EmptyRoot className="border">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Inbox />
				</EmptyMedia>
				<EmptyTitle>No invites</EmptyTitle>
				<EmptyDescription>
					When a teammate invites you to their workspace, it shows up here.
				</EmptyDescription>
			</EmptyHeader>
		</EmptyRoot>
	);
}
