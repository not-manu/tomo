import { Create as CreateNamespace } from "./create";
import { Danger as DangerNamespace } from "./danger";
import { Header as HeaderNamespace } from "./header";
import { List as ListNamespace } from "./list";
import { Members as MembersNamespace } from "./members";
import { Settings as SettingsNamespace } from "./settings";
import { Wallpaper as WallpaperNamespace } from "./wallpaper";

export namespace Workspace {
	export import Create = CreateNamespace;
	export import Danger = DangerNamespace;
	export import Header = HeaderNamespace;
	export import List = ListNamespace;
	export import Members = MembersNamespace;
	export import Settings = SettingsNamespace;
	export import Wallpaper = WallpaperNamespace;
}
