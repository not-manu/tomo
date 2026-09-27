import { App as AppComponent } from "./app";
import { Crumbs as CrumbsComponent } from "./crumbs";
import { Site as SiteComponent } from "./site";

export namespace Header {
	export const Site = SiteComponent;
	export const App = AppComponent;
	export const Crumbs = CrumbsComponent;
}
