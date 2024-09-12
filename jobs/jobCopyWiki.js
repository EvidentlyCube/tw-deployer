import * as fs from "node:fs";
import { actionCreatePm2Config } from "../actions/actionCreatePm2Config.js";
import { actionDetermineWikiPort } from "../actions/actionDetermineWikiPort.js";
import { actionNginxAddWiki } from "../actions/actionNginxAddWiki.js";
import { actionNginxRestart } from "../actions/actionNginxRestart.js";
import { actionPm2Delete } from "../actions/actionPm2Delete.js";
import { actionPm2Save } from "../actions/actionPm2Save.js";
import { actionPm2Start } from "../actions/actionPm2Start.js";
import { actionPreparePackageJson } from "../actions/actionPreparePackageJson.js";
import { actionTiddlerUpdateHost } from "../actions/actionTiddlerUpdateHost.js";
import { actionTiddlerUpdateTitle } from "../actions/actionTiddlerUpdateTitle.js";
import { actionWikiCleanup } from "../actions/actionWikiCleanup.js";
import { actionWikiCopy } from "../actions/actionWikiCopy.js";
import { canAccessFile, fileExists, isDirectory } from "../utils/FileUtils.js";
import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiAction, acquireLock, releaseLock } from "../utils/LockUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function startJobCopyWiki(
	title,
	template,
	wikiPath
) {
	if (!acquireLock(LockTypeWikiAction)) {
		throw Error("Server is busy processing wiki creation, please wait for the operation to finish.");
	}

	try {
		return startJob(
			`Copy wiki '${template}' to '${wikiPath}'`,
			log => runJob(log, title, template, wikiPath)
		);

	} finally {
		releaseLock(LockTypeWikiAction);
	}
}


async function runJob(log, title, wikiPathSource, wikiPathNew) {
	log("Job started");

	await validateParams(title, wikiPathSource, wikiPathNew);

	await actionWikiCopy(wikiPathSource, wikiPathNew, log);
	await actionTiddlerUpdateHost(wikiPathNew, log);
	await actionTiddlerUpdateTitle(wikiPathNew, title, log);
	await actionWikiCleanup(wikiPathNew, log);

	const port = await actionDetermineWikiPort(wikiPathNew, log);

	await actionPreparePackageJson(wikiPathNew, port, log);
	await actionCreatePm2Config(wikiPathNew, port, log);
	await actionPm2Delete(wikiPathNew, log);
	await actionPm2Start(wikiPathNew, log);
	await actionPm2Save(log);
	await actionNginxAddWiki(wikiPathNew, port, log);
	await actionNginxRestart(log);

	log("Job finished");
}

async function validateParams(title, template, wikiPath) {
	if (!title) {
		throw Error("Missing `title`");
	}

	if (!isValidWikiPath(template)) {
		throw Error("Invalid template name");

	} else if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const templateAbsPath = getWikiAbsolutePath(template);
	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (await fileExists(wikiAbsPath)) {
		throw Error("Wiki already exists");

	} else if (!await fileExists(templateAbsPath)) {
		throw Error("Template wiki not found");

	} else if (!await canAccessFile(templateAbsPath, fs.constants.R_OK)) {
		throw Error("Template wiki is not readable");

	} else if (!await isDirectory(templateAbsPath)) {
		throw Error("Template wiki is not a directory!");
	}
}
