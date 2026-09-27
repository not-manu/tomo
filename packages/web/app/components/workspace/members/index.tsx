import { InviteForm as InviteFormComponent } from "./invite-form";
import { Item as ItemComponent } from "./item";
import { Nudge as NudgeComponent } from "./nudge";
import { Pending as PendingComponent } from "./pending";
import { Root as RootComponent } from "./root";

export namespace Members {
	export const Root = RootComponent;
	export const Item = ItemComponent;
	export const Pending = PendingComponent;
	export const InviteForm = InviteFormComponent;
	export const Nudge = NudgeComponent;
}
