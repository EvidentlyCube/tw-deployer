import { startJobTest } from "../jobs/jobTest.js";
import { validateCsrfToken } from "../utils/Csrf.js";
import { ApiError } from "../utils/Errors.js";
import { fileExists } from "../utils/FileUtils.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { assertPost, getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=wiki-delete/:wikiPath",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", title: "" });

	const { wikiPath } = await validateParams(req);

	const jobId = await startJobTest(5000);
	respondApiSuccess(res, jobId);
}

async function validateParams(req) {
	await validateCsrfToken(req.body.csrf);

	const { wikiPath } = req.pathParams;
	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (!await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki already exists");
	}

	return { wikiPath };
}