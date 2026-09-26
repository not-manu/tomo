import { useInbox } from "~/hooks/use-invites";
import { Empty } from "./empty";
import { Item } from "./item";
import { Loading } from "./loading";

export function Root() {
	const { data: invites, isPending, error } = useInbox();

	if (isPending) return <Loading />;
	if (error) return <p className="text-destructive text-sm">{error.message}</p>;
	if (invites.length === 0) return <Empty />;

	return (
		<ul className="flex flex-col divide-y rounded-2xl border">
			{invites.map((invite) => (
				<Item key={invite.id} invite={invite} />
			))}
		</ul>
	);
}
