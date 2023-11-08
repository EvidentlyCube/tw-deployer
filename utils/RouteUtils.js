import { NotFoundError } from "./Errors.js";

export function getRouteData(routePath, action) {
	const routeStripped = routePath.replace(/:[^\\]+/g, "");

	return {
		pathArgumentCount: routePath.split(":").length - 1,
		strippedRouteLength: routeStripped.length,
		route: routeToRegexp(routePath),
		rawRoute: routePath,
		action
	};
}

function routeToRegexp(route) {
	route = route
		.replace(/([?/$^*])/g, "\\$1")
		.replace(/:rest:([^/\\\\]+)/g, "(?<$1>.+)")
		.replace(/:([^/\\\\]+)/g, "(?<$1>[^\\/]+)");

	return new RegExp(`^${route}$`);
}

export function assertPost(req) {
	if (req.method !== "POST") {
		throw new NotFoundError();
	}
}