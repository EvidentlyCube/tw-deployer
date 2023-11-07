import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { ActionError } from "../utils/Errors.js";
import { fileExists } from "../utils/FileUtils.js";
import { getWikiBackupsAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function actionDeleteBackup(wikiPath, backup, log) {
	log(`[Action: delete backup '${wikiPath}/${backup}'`);

	if (!isValidWikiPath(wikiPath)) {
		throw new ActionError(`Invalid wiki path '${wikiPath}'`);
	} else if (backup.includes("/") || backup.includes("\\") || backup.includes("..")) {
		throw new ActionError(`Invalid backup name '${backup}'`);
	}

	const backupPath = resolve(
		getWikiBackupsAbsolutePath(wikiPath),
		backup
	);

	if (!await fileExists(backupPath)) {
		throw new ActionError(`Backup '${backupPath}' does not exist`);
	}

	await rm(backupPath);

	log("[/Action]");
}