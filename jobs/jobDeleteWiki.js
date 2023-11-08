import { actionBackupDeleteAll } from "../actions/actionBackupDeleteAll.js";
import { actionNginxRemoveWiki } from "../actions/actionNginxRemoveWiki.js";
import { actionNginxRestart } from "../actions/actionNginxRestart.js";
import { actionPm2Delete } from "../actions/actionPm2Delete.js";
import { actionWikiDelete } from "../actions/actionWikiDelete.js";
import { fileExists } from "../utils/FileUtils.js";
import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiAction, acquireLock, releaseLock } from "../utils/LockUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function startJobDeleteWiki(
	wikiPath
) {
	if (!acquireLock(LockTypeWikiAction)) {
		throw Error("Server is busy processing wiki action, please wait for the operation to finish.");
	}

	try {
		return startJob(
			`Delete wiki '${wikiPath}'`,
			log => runJob(log, wikiPath)
		);

	} finally {
		releaseLock(LockTypeWikiAction);
	}
}


async function runJob(log, wikiPath) {
	log("Job started");

	await validateParams(wikiPath);

	await actionNginxRemoveWiki(wikiPath, log);
	await actionPm2Delete(wikiPath, log);
	await actionBackupDeleteAll(wikiPath, log);
	await actionWikiDelete(wikiPath, log);

	await actionNginxRestart(log);

	log("Job finished");
}

async function validateParams(wikiPath) {
	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (!await fileExists(wikiAbsPath)) {
		throw Error("Wiki does not exist");
	}
}
