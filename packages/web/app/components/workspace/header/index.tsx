import { Danger as DangerComponent } from "./danger";
import { Loading as LoadingComponent } from "./loading";
import { Rename as RenameComponent } from "./rename";
import { Root as RootComponent } from "./root";

export namespace Header {
	export const Root = RootComponent;
	export const Rename = RenameComponent;
	export const Danger = DangerComponent;
	export const Loading = LoadingComponent;
}
