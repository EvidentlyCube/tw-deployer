import * as fs from "node:fs";
import { actionAddWikiToNginx } from "../actions/actionAddWikiToNginx.js";
import { actionCopyWiki } from "../actions/actionCopyWiki.js";
import { actionCreatePm2Config } from "../actions/actionCreatePm2Config.js";
import { actionDetermineWikiPort } from "../actions/actionDetermineWikiPort.js";
import { actionPm2Delete } from "../actions/actionPm2Delete.js";
import { actionPm2Save } from "../actions/actionPm2Save.js";
import { actionPm2Start } from "../actions/actionPm2Start.js";
import { actionPreparePackageJson } from "../actions/actionPreparePackageJson.js";
import { actionRestartNginx } from "../actions/actionRestartNginx.js";
import { actionTwPrepare } from "../actions/actionTwPrepare.js";
import { actionTwUpdateTitle } from "../actions/actionTwUpdateTitle.js";
import { actionUpdateHostTiddler } from "../actions/actionUpdateHostTiddler.js";
import { canAccessFile, fileExists, isDirectory } from "../utils/FileUtils.js";
import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiCreation, acquireLock, releaseLock } from "../utils/LockUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function startJobCopyWiki(
	title,
	template,
	wikiPath
) {
	if (!acquireLock(LockTypeWikiCreation)) {
		throw Error("Server is busy processing wiki creation, please wait for the operation to finish.");
	}

	try {
		return startJob(
			`Copy wiki '${template}' to '${wikiPath}'`,
			log => runJob(log, title, template, wikiPath)
		);

	} finally {
		releaseLock(LockTypeWikiCreation);
	}
}


async function runJob(log, title, template, wikiPath) {
	log("Job started");

	await validateParams(title, template, wikiPath);

	await actionCopyWiki(template, wikiPath, log);
	await actionUpdateHostTiddler(wikiPath, log);
	await actionTwUpdateTitle(wikiPath, title, log);
	await actionTwPrepare(wikiPath, log);

	const port = await actionDetermineWikiPort(wikiPath, log);

	await actionPreparePackageJson(wikiPath, port, log);
	await actionCreatePm2Config(wikiPath, port, log);
	await actionPm2Delete(wikiPath, log);
	await actionPm2Start(wikiPath, log);
	await actionPm2Save(log);
	await actionAddWikiToNginx(wikiPath, port, log);
	await actionRestartNginx(log);

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
