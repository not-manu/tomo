import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("routes/home/page.tsx"),
	layout("routes/site/layout.tsx", [
		route("login", "routes/site/login/page.tsx"),
		route("privacy", "routes/site/privacy/page.tsx"),
		route("terms", "routes/site/terms/page.tsx"),
	]),
	layout("routes/app/layout.tsx", [
		route("app", "routes/app/page.tsx"),
		route("w/:workspace", "routes/w/[workspace]/page.tsx"),
		route("w/:workspace/settings", "routes/w/[workspace]/settings/page.tsx"),
	]),
] satisfies RouteConfig;
