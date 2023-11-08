import { rm } from "node:fs/promises";
import { getWikiBackupsAbsolutePath } from "../utils/PathUtils.js";

export async function actionBackupDeleteAll(wikiPath, log) {
	log(`[Action: delete all backups for wiki '${wikiPath}']`);

	const wikiPathAbs = getWikiBackupsAbsolutePath(wikiPath);

	await rm(wikiPathAbs, { recursive: true });

	log("[/Action]");
}