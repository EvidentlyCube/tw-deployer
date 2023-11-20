import { readdir } from "node:fs/promises";
import { fileExists } from "../utils/FileUtils.js";
import { getWikiBackupsAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=wiki-backups/:wikiPath",
	action
);

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const backupsAbsolutePath = getWikiBackupsAbsolutePath(wikiPath);

	if (await fileExists(backupsAbsolutePath)) {
		return respondApiSuccess(res, await readdir(backupsAbsolutePath));
	} else {
		return respondApiSuccess(res, []);
	}
}