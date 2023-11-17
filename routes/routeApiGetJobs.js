import {resolve} from "node:path";
import { getRouteData } from "../utils/RouteUtils.js";
import { getAllWikiPaths } from "../utils/TwUtils.js";
import { respondApiSuccess } from "./respond.js";
import Config from "../config.js";
import { readdir } from "node:fs/promises";

export default getRouteData(
	"/?api=jobs",
	action
);

async function action(req, res) {
	const jobLogsDirAbs = resolve(Config.Paths.Logs, "jobs");
	const files = await readdir(jobLogsDirAbs, {withFileTypes: true});

	for (const file of files) {
		// file.
	}

	respondApiSuccess(res, await getAllWikiPaths());
}