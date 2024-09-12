import * as fs from "node:fs";
import { startJobCopyWiki } from "../../jobs/jobCopyWiki.js";
import { validateCsrfToken } from "../../utils/Csrf.js";
import { ApiError } from "../../utils/Errors.js";
import { canAccessFile, fileExists, isDirectory } from "../../utils/FileUtils.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../../utils/PathUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=wiki/copy/:template",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", wikiPath: "", title: "" });

	const { title, template, wikiPath } = await validateParams(req);

	const jobId = await startJobCopyWiki(title, template, wikiPath);
	respondApiSuccess(res, jobId);
}

async function validateParams(req) {
	const { csrf, wikiPath, title } = req.body;
	const { template } = req.pathParams;

	await validateCsrfToken(csrf);

	if (!title) {
		throw new ApiError(400, "Payload is missing `title`");
	}

	if (!isValidWikiPath(template)) {
		throw Error("Invalid template name");

	} else if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	if (template === ".") {
		throw new ApiError(500, "Special handler for creating a fresh wiki is not implemented");
	}

	const templateAbsPath = getWikiAbsolutePath(template);
	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki already exists");

	} else if (!await fileExists(templateAbsPath)) {
		throw new ApiError(400, "Template wiki not found");

	} else if (!await canAccessFile(templateAbsPath, fs.constants.R_OK)) {
		throw new ApiError(400, "Template wiki is not readable");

	} else if (!await isDirectory(templateAbsPath)) {
		throw new ApiError(400, "Template wiki is not a directory!");
	}

	return { title, template, wikiPath };
}