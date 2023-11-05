import * as fs from "node:fs";
import { actionAddWikiToNginx } from "../actions/actionAddWikiToNginx.js";
import { actionCopyWiki } from "../actions/actionCopyWiki.js";
import { actionCreatePm2Config } from "../actions/actionCreatePm2Config.js";
import { actionDetermineWikiPort } from "../actions/actionDetermineWikiPort.js";
import { actionPreparePackageJson } from "../actions/actionPreparePackageJson.js";
import { actionRegisterWikiInPm2 } from "../actions/actionRegisterWikiInPm2.js";
import { actionRestartNginx } from "../actions/actionRestartNginx.js";
import { actionTwPrepare } from "../actions/actionTwPrepare.js";
import { actionTwUpdateTitle } from "../actions/actionTwUpdateTitle.js";
import { actionUpdateHostTiddler } from "../actions/actionUpdateHostTiddler.js";
import { ActionError, ApiError } from "../utils/Errors.js";
import { canAccessFile, fileExists, isDirectory } from "../utils/FileUtils.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";
import { assertPost, routeToRegexp } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

const validNameRegexp = /^[a-z0-9-]+$/;

let lock = false;
const logs = [];

export default {
	route: routeToRegexp("/?api/create/:template/:wikiPath"),
	action
};

async function action(req, res) {
	try {
		return await actionInternal(req, res);

	} catch (e) {
		if (e instanceof ActionError) {
			throw new ApiError(500, e.message);
		}

		throw e;
	} finally {
		lock = false;
		logs.length = 0;
	}
}

async function actionInternal(req, res) {
	if (lock) {
		throw new ApiError(400, "Server is busy processing wiki creation...");
	}

	assertPost(req);
	req.body = await extractBodyJson(req);

	lock = true;
	log("Job started");

	const { template, wikiPath } = await validateParams(req);

	await actionCopyWiki(template, wikiPath, log);
	await actionUpdateHostTiddler(wikiPath, log);
	await actionTwUpdateTitle(wikiPath, req.body.title, log);
	await actionTwPrepare(wikiPath, log);

	const port = await actionDetermineWikiPort(wikiPath, log);

	await actionPreparePackageJson(wikiPath, port, log);
	await actionCreatePm2Config(wikiPath, port, log);
	await actionRegisterWikiInPm2(wikiPath, log);
	await actionAddWikiToNginx(wikiPath, port, log);
	await actionRestartNginx(log);

	respondApiSuccess(res, "Operation completed");
}


async function validateParams(req) {
	// await validateCsrfToken(req.body.csrf);

	if (!req.body.title) {
		throw new ApiError(400, "Payload is missing `title`");
	}

	const { template, wikiPath } = req.pathParams;
	if (!validNameRegexp.test(template) && template !== ".") {
		throw new ApiError(400, "Invalid template name");
	} else if (!validNameRegexp.test(wikiPath)) {
		throw new ApiError(400, "Invalid new TW name");
	}

	if (template === ".") {
		throw new ApiError(500, "Special handler for creating a fresh wiki is not implemented");
	}

	const templatePath = getWikiAbsolutePath(template);
	const newWikiPath = getWikiAbsolutePath(wikiPath);

	if (await fileExists(newWikiPath)) {
		throw new ApiError(400, "Wiki already exists");

	} else if (!await fileExists(templatePath)) {
		throw new ApiError(400, "Template wiki not found");

	} else if (!await canAccessFile(templatePath, fs.constants.R_OK)) {
		throw new ApiError(400, "Template wiki is not readable");

	} else if (!await isDirectory(templatePath)) {
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

function log(log) {
	logs.push(log);
	console.log(log);
}