import { readdir } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { CoreLog } from "../utils/Logger.js";

export const Routes = [];

buildRoutesArray();

async function buildRoutesArray() {
	CoreLog("routes", "Building routes array");

	const routesDirAbs = dirname(fileURLToPath(import.meta.url));

	Routes.push(...await getRoutesIn(routesDirAbs));

	Routes.sort((l, r) => {
		if (l.pathArgumentCount !== r.pathArgumentCount) {
			return r.pathArgumentCount - l.pathArgumentCount;
		} else if (l.strippedRouteLength !== r.strippedRouteLength) {
			return r.strippedRouteLength - l.strippedRouteLength;
		} else {
			return 0;
		}
	});

	CoreLog("routes", `Found ${Routes.length} routes`);
}

async function getRoutesIn(dirAbs) {
	CoreLog("routes", `Searching for routes in ${dirAbs}`);
	const files = await readdir(dirAbs, {withFileTypes: true});

	CoreLog("routes", `Checking ${files.length} files in ${dirAbs}`);

	const routes = [];
	for (const file of files) {
		const fileAbs = resolve(dirAbs, file.name);

		if (file.isDirectory()) {
			routes.push(...await getRoutesIn(fileAbs));
			continue;
		}

		if (!file.name.endsWith(".route.js")) {
			CoreLog("routes", `Not a route file: ${fileAbs}`);
			continue;
		}

		const module = await import(fileAbs);
		if (!module.default.route || !module.default.action) {
			CoreLog("routes", `File missing route data: ${fileAbs}`);
			continue;
		}

		CoreLog("routes", `Found route: ${module.default.rawRoute}`);
		Routes.push(module.default);
	}

	return routes;
}