import { Create as CreateNamespace } from "./create";
import { Cursors as CursorsNamespace } from "./cursors";
import { Danger as DangerNamespace } from "./danger";
import { Header as HeaderNamespace } from "./header";
import { List as ListNamespace } from "./list";
import { Lobby as LobbyNamespace } from "./lobby";
import { Members as MembersNamespace } from "./members";
import { Settings as SettingsNamespace } from "./settings";
import { Usage as UsageNamespace } from "./usage";
import { Wallpaper as WallpaperNamespace } from "./wallpaper";

export namespace Workspace {
	export import Create = CreateNamespace;
	export import Cursors = CursorsNamespace;
	export import Danger = DangerNamespace;
	export import Header = HeaderNamespace;
	export import List = ListNamespace;
	export import Lobby = LobbyNamespace;
	export import Members = MembersNamespace;
	export import Settings = SettingsNamespace;
	export import Usage = UsageNamespace;
	export import Wallpaper = WallpaperNamespace;
}
