import { Empty as EmptyComponent } from "./empty";
import { Item as ItemComponent } from "./item";
import { Loading as LoadingComponent } from "./loading";
import { Root as RootComponent } from "./root";

export namespace Inbox {
	export const Root = RootComponent;
	export const Item = ItemComponent;
	export const Empty = EmptyComponent;
	export const Loading = LoadingComponent;
}
