import { validateCsrfToken } from "../utils/Csrf.js";
import { ApiError } from "../utils/Errors.js";
import { createTempFilePath, fileExists } from "../utils/FileUtils.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { assertPost, getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=wiki/upload",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", wikiPath: "", title: "", archive: "", archiveName: "" });

	const { title, wikiPath, archive, archiveName } = await validateParams(req);

	const archivePath = createTempFilePath;

	console.log(title, wikiPath, archive);

	// const jobId = await startJobCreateWiki(title, wikiPath);
	respondApiSuccess(res, 1);
}

async function validateParams(req) {
	const { csrf, wikiPath, title, archive, archiveName } = req.body;

	await validateCsrfToken(csrf);

	if (!title) {
		throw new ApiError(400, "Payload is missing `title`");
	}

	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki already exists");
	}

	return { title, wikiPath, archive, archiveName };
}