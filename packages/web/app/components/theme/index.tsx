import { ThemeProvider } from "./provider";
import { Switch as SwitchComponent } from "./switch";
import { ModeToggle } from "./toggle";

export namespace Theme {
	export const Provider = ThemeProvider;
	export const Toggle = ModeToggle;
	export const Switch = SwitchComponent;
}
