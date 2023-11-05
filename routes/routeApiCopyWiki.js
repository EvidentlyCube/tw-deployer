import * as fs from "node:fs";
import { startJobCopyWiki } from "../jobs/jobCopyWiki.js";
import { validateCsrfToken } from "../utils/Csrf.js";
import { ApiError } from "../utils/Errors.js";
import { canAccessFile, fileExists, isDirectory } from "../utils/FileUtils.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { assertPost, routeToRegexp } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default {
	route: routeToRegexp("/?api/copy-wiki/:template/:wikiPath"),
	action
};

async function action(req, res) {
	assertPost(req);

	req.body = await extractBodyJson(req);

	const { template, wikiPath } = await validateParams(req);

	const jobId = await startJobCopyWiki(req.body.title, template, wikiPath);
	respondApiSuccess(res, { jobId });
}

async function validateParams(req) {
	await validateCsrfToken(req.body.csrf);

	if (!req.body.title) {
		throw new ApiError(400, "Payload is missing `title`");
	}

	const { template, wikiPath } = req.pathParams;
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

	return { template, wikiPath };
}

async function extractBodyJson(req) {
	const json = await parseRequestBodyJson(req);

	return {
		csrf: json.csrf ?? "",
		title: json.title ?? ""
	};
}