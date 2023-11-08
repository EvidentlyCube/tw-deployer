import { readdir } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const Routes = [];

buildRoutesArray();

async function buildRoutesArray() {
	const dir = dirname(fileURLToPath(import.meta.url));
	const files = await readdir(dir);

	for (const file of files) {
		if (!file.startsWith("route") || file === "routes.js") {
			continue;
		}

		const module = await import(resolve(dir, file));
		if (!module.default.route || !module.default.action) {
			continue;
		}

		Routes.push(module.default);
	}

	Routes.sort((l, r) => {
		if (l.pathArgumentCount !== r.pathArgumentCount) {
			return r.pathArgumentCount - l.pathArgumentCount;
		} else if (l.strippedRouteLength !== r.strippedRouteLength) {
			return r.strippedRouteLength - l.strippedRouteLength;
		} else {
			return 0;
		}
	});
}