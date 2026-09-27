import { Dock as DockComponent } from "./dock";
import { Surface as SurfaceComponent } from "./surface";
import { Tab as TabComponent } from "./tab";
import { Tabs as TabsComponent } from "./tabs";
import { Terminal as TerminalComponent } from "./terminal";
import { Window as WindowComponent } from "./window";

export namespace Desktop {
	export const Dock = DockComponent;
	export const Surface = SurfaceComponent;
	export const Tab = TabComponent;
	export const Tabs = TabsComponent;
	export const Terminal = TerminalComponent;
	export const Window = WindowComponent;
}
