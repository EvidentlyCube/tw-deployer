import { readdir, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { getWikiBackupsAbsolutePath } from "../utils/PathUtils.js";
import { getAllWikiPaths } from "../utils/TwUtils.js";
import { registerSchedulerTask } from "./Scheduler.js";

export function registerScheduleNightlyBackupCleanup() {
	if (!Config.NumberOfBackupsToKeep) {
		throw new Error("Config.NumberOfBackupsToKeep is not configured");
	}

	registerSchedulerTask(
		"nightly-backup-cleanup",
		"Nightly backup cleanup",
		() => {
			const now = new Date();
			now.setDate(now.getDate() + 1);
			now.setHours(0);
			now.setMinutes(30);
			now.setSeconds(0);
			return now;
		},
		run
	);
}

async function run() {
	const wikis = await getAllWikiPaths();

	for (const wikiPath of wikis) {
		const backupAbsPath = getWikiBackupsAbsolutePath(wikiPath);
		const files = await readdir(backupAbsPath);

		files.sort((l, r) => r.localeCompare(l));

		const filesToDelete = files.slice(Config.NumberOfBackupsToKeep);
		await Promise.all(filesToDelete.map(file => unlink(resolve(backupAbsPath, file))));
	}
}