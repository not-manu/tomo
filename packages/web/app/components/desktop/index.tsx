import { Dock as DockComponent } from "./dock";
import { Editor as EditorComponent } from "./editor";
import { FileIcon as FileIconComponent } from "./file-icon";
import { Files as FilesComponent } from "./files";
import { Finder as FinderComponent } from "./finder";
import { Preview as PreviewComponent } from "./preview";
import { Surface as SurfaceComponent } from "./surface";
import { Tab as TabComponent } from "./tab";
import { Tabs as TabsComponent } from "./tabs";
import { Terminal as TerminalComponent } from "./terminal";
import { Window as WindowComponent } from "./window";

export namespace Desktop {
	export const Dock = DockComponent;
	export const Editor = EditorComponent;
	export const FileIcon = FileIconComponent;
	export const Files = FilesComponent;
	export const Finder = FinderComponent;
	export const Preview = PreviewComponent;
	export const Surface = SurfaceComponent;
	export const Tab = TabComponent;
	export const Tabs = TabsComponent;
	export const Terminal = TerminalComponent;
	export const Window = WindowComponent;
}
