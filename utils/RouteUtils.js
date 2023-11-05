import { NotFoundError } from "./Errors.js";

export function routeToRegexp(route) {
	route = route
		.replace(/([?/$^*])/g, "\\$1")
		.replace(/:([^/\\\\]+)/g, "(?<$1>[^\\/]+)");

	return new RegExp(`^${route}$`);
}

export function assertPost(req) {
	if (req.method !== "POST") {
		throw new NotFoundError();
	}
}