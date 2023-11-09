import { actionBackupTiddlers } from "../actions/actionBackupTiddlers.js";
import { validateCsrfToken } from "../utils/Csrf.js";
import { ApiError } from "../utils/Errors.js";
import { fileExists } from "../utils/FileUtils.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { doNull } from "../utils/MiscUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { assertPost, getRouteData } from "../utils/RouteUtils.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=backup-wiki/:wikiPath",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "" });

	const { wikiPath } = await validateParams(req);

	try {
		actionBackupTiddlers(wikiPath, doNull);
		respondApiSuccess(res, true);
	} catch (error) {
		respondApiError(res, 500, error.message);
	}
}

async function validateParams(req) {
	await validateCsrfToken(req.body.csrf);

	const { wikiPath } = req.pathParams;
	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (!await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki does not exists");
	}

	return { wikiPath };
}