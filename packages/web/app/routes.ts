import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("routes/home/page.tsx"),
	layout("routes/site/layout.tsx", [
		route("login", "routes/site/login/page.tsx"),
		route("privacy", "routes/site/privacy/page.tsx"),
		route("terms", "routes/site/terms/page.tsx"),
	]),
	route("app", "routes/app/layout.tsx", [index("routes/app/page.tsx")]),
] satisfies RouteConfig;
