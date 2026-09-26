import { Inbox } from "lucide-react";
import {
	Empty as EmptyRoot,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
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
