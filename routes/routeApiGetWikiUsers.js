import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileExists } from "../utils/FileUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondApiError, respondApiSuccess } from "./respond.js";
import { empty } from "../utils/MiscUtils.js";

export default getRouteData(
	"/?api=wiki/users/:wikiPath",
	action
);

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const wikiDirAbs = getWikiAbsolutePath(wikiPath);
	const usersCsvPathAbs = resolve(wikiDirAbs, "wiki", "users.csv");

	if (!await fileExists(usersCsvPathAbs)) {
		return respondApiError(res, 500, "`users.csv` not found, this wiki is most likely broken");
	}

	const csv = await readFile(usersCsvPathAbs, "utf-8");

	const users = csv.split("\n").slice(1).map(row => row.split(",")[0]).filter(empty);

	respondApiSuccess(res, users);
}