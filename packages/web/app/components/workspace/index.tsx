import { Create as CreateNamespace } from "./create";
import { Header as HeaderNamespace } from "./header";
import { List as ListNamespace } from "./list";
import { Members as MembersNamespace } from "./members";

export namespace Workspace {
	export import Create = CreateNamespace;
	export import Header = HeaderNamespace;
	export import List = ListNamespace;
	export import Members = MembersNamespace;
}
