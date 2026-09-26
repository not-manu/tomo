import { Avatar as AvatarComponent } from "./avatar";
import { Dropdown as DropdownNamespace } from "./dropdown";

export namespace User {
	export const Avatar = AvatarComponent;
	export import Dropdown = DropdownNamespace;
}
