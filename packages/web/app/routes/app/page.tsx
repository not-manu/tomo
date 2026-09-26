import { User } from "@tomo/api";
import { Text } from "~/components/text";
import { useSession } from "~/lib/auth";

export default function AppPage() {
	const { data: session } = useSession();
	const firstName = session ? User.firstName(session.user) : "";

	return (
		<div className="flex flex-col items-center">
			<div className="w-full max-w-sm">
				<Text.Heading>Welcome{firstName && `, ${firstName}`}</Text.Heading>
				<Text.Subtext>There's nothing here yet.</Text.Subtext>
			</div>
		</div>
	);
}
