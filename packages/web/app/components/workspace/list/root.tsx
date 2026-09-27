import { useWorkspaces } from "~/hooks/use-workspace";
import { Create } from "../create";
import { Empty } from "./empty";
import { Item } from "./item";
import { Loading } from "./loading";

export function Root() {
	const { data: workspaces, isPending, error } = useWorkspaces();

	if (isPending) return <Loading />;
	if (error) return <p className="text-destructive text-sm">{error.message}</p>;
	if (workspaces.length === 0) return <Empty />;

	return (
		<ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{workspaces.map((workspace) => (
				<Item key={workspace.id} workspace={workspace} />
			))}
			<li>
				<Create.Card />
			</li>
		</ul>
	);
}
