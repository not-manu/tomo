import { User as TomoUser } from "@tomo/api";
import { ArrowRight } from "lucide-react";
import { Tomo } from "~/components/tomo";
import { Button as UiButton } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { User } from "~/components/user";
import { useSession } from "~/lib/auth";

export function Button() {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<UiButton aria-label="Loading" disabled size="lg">
				<Spinner />
			</UiButton>
		);
	}

	if (session) {
		const { user } = session;
		return (
			<UiButton asChild size="lg">
				<Tomo.Link to="/app">
					Continue as
					<User.Avatar id={user.id} image={user.image ?? null} name={user.name} size="xs" />
					{TomoUser.firstName(user)}
					<ArrowRight />
				</Tomo.Link>
			</UiButton>
		);
	}

	return (
		<>
			<UiButton asChild size="lg">
				<Tomo.Link to="/login">Sign up</Tomo.Link>
			</UiButton>
			<UiButton asChild size="lg" variant="secondary">
				<Tomo.Link to="/login">Log in</Tomo.Link>
			</UiButton>
		</>
	);
}
