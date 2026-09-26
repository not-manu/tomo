import { Button as ButtonComponent } from "./button";
import { Root as RootComponent, type Target as TargetType } from "./root";

export namespace Danger {
	export const Root = RootComponent;
	export const Button = ButtonComponent;
	export type Target = TargetType;
}
