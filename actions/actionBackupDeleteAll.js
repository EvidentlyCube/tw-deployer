import { rm } from "node:fs/promises";
import { fileExists } from "../utils/FileUtils.js";
import { getWikiBackupsAbsolutePath } from "../utils/PathUtils.js";

export async function actionBackupDeleteAll(wikiPath, log) {
	log(`[Action: delete all backups for wiki '${wikiPath}']`);

	const backupPathAbs = getWikiBackupsAbsolutePath(wikiPath);

	if (await fileExists(backupPathAbs)) {
		await rm(backupPathAbs, { recursive: true });
	}

	log("[/Action]");
}