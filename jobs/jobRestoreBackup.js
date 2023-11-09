import { resolve } from "node:path";
import { actionUntarWiki } from "../actions/actionUntarWiki.js";
import { fileExists, isDirectory } from "../utils/FileUtils.js";
import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiAction, acquireLock, releaseLock } from "../utils/LockUtils.js";
import { getWikiAbsolutePath, getWikiBackupsAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function startJobRestoreBackup(
	wikiPath,
	backup
) {
	if (!acquireLock(LockTypeWikiAction)) {
		throw Error("Server is busy processing wiki action, please wait for the operation to finish.");
	}

	try {
		return startJob(
			`Restore wiki backup '${wikiPath}/${backup}'`,
			log => runJob(log, wikiPath, backup)
		);

	} finally {
		releaseLock(LockTypeWikiAction);
	}
}


async function runJob(log, wikiPath, backup) {
	log("Job started");

	const { backupPathAbs } = await validateParams(wikiPath, backup);

	await actionUntarWiki(backupPathAbs, log);

	log("Job finished");
}

async function validateParams(wikiPath, backup) {
	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiDirAbs = getWikiAbsolutePath(wikiPath);

	if (!await fileExists(wikiDirAbs)) {
		throw Error("Wiki does not exist");
	}

	const backupPathAbs = resolve(
		getWikiBackupsAbsolutePath(wikiPath),
		backup
	);

	if (!await fileExists(backupPathAbs)) {
		throw new Error(`Backup '${backupPathAbs}' does not exist`);
	} else if (await isDirectory(backupPathAbs)) {
		throw new Error(`Backup '${backupPathAbs}' is a directory while it should be a file`);
	}

	return { backupPathAbs };
}
