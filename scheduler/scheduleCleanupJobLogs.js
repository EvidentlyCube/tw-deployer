import { resolve } from "node:path";
import Config from "../config.js";
import { registerSchedulerJob } from "./Scheduler.js";
import {readdir, stat, unlink} from "node:fs/promises";
import { fileExists } from "../utils/FileUtils.js";

export function registerScheduleCleanupJobLogs() {
	registerSchedulerJob(
		"nightly-job-log-cleanup",
		"Nightly cleanup job logs",
		() => {
			const now = new Date();
			now.setDate(now.getDate() + 1);
			now.setHours(1);
			now.setMinutes(0);
			now.setSeconds(0);
			return now;
		},
		run
	);
}

async function run() {
	const jobLogsDirAbs = resolve(Config.Paths.Logs, "jobs");
	const files = await readdir(jobLogsDirAbs, {withFileTypes: true});

	const logFilesWithCreationTime = [];
	for (const file of files) {
		if (file.isDirectory()) {
			continue;
		}

		if (!file.name.endsWith(".log")) {
			continue;
		}

		const logPathAbs = resolve(file.path, file.name);
		const fileStat = await stat(logPathAbs);
		logFilesWithCreationTime.push([logPathAbs, fileStat.ctimeMs]);
	}

	logFilesWithCreationTime.sort((l, r) => r[1] - l[1]);

	for (const [logPathAbs] of logFilesWithCreationTime.slice(Config.JobLogsToKeep)) {
		const metaPathAbs = logPathAbs.substring(0, logPathAbs.length - 4) + ".meta";

		if (await fileExists(metaPathAbs)) {
			await unlink(metaPathAbs);
		}

		await unlink(logPathAbs);
	}
}