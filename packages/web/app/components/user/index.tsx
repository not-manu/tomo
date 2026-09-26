import { Avatar as AvatarComponent } from "./avatar";
import { Dropdown as DropdownNamespace } from "./dropdown";
import { Stack as StackComponent } from "./stack";

export namespace User {
	export const Avatar = AvatarComponent;
	export const Stack = StackComponent;
	export import Dropdown = DropdownNamespace;
}
