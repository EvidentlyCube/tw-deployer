import { startJobCreateWiki } from "../../jobs/jobCreateWiki.js";
import { validateCsrfToken } from "../../utils/Csrf.js";
import { ApiError } from "../../utils/Errors.js";
import { fileExists } from "../../utils/FileUtils.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../../utils/PathUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=wiki/create",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", wikiPath: "", title: "" });

	const { title, wikiPath } = await validateParams(req);

	const jobId = await startJobCreateWiki(title, wikiPath);
	respondApiSuccess(res, jobId);
}

async function validateParams(req) {
	const { csrf, wikiPath, title } = req.body;

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

	return { title, wikiPath };
}