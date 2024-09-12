import { readdir, stat, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { fileExists } from "../utils/FileUtils.js";
import { registerSchedulerTask } from "./Scheduler.js";

export function registerScheduleCleanupJobLogs() {
	if (!Config.JobLogsToKeep) {
		throw new Error("Config.JobLogsToKeep is not configured");
	}

	registerSchedulerTask(
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

async function run(log) {
	await removeLogsWithoutMeta(log);

	log("Remove old logs");
	const jobLogsDirAbs = resolve(Config.Paths.Logs, "jobs");
	const files = await readdir(jobLogsDirAbs, { withFileTypes: true });

	log(`Found ${files.length} files`);
	const metaFilesWithCreationTime = [];
	for (const file of files) {
		if (file.isDirectory()) {
			continue;
		}

		if (!file.name.endsWith(".meta")) {
			continue;
		}

		const logPathAbs = resolve(file.path, file.name);
		const fileStat = await stat(logPathAbs);
		metaFilesWithCreationTime.push([logPathAbs, fileStat.ctimeMs]);
	}

	metaFilesWithCreationTime.sort((l, r) => r[1] - l[1]);

	for (const [metaPathAbs] of metaFilesWithCreationTime.slice(Config.JobLogsToKeep)) {
		const logsPathAbs = metaPathAbs.substring(0, metaPathAbs.length - 5) + ".job";

		if (await fileExists(logsPathAbs)) {
			log(`Unlink ${logsPathAbs}`);
			await unlink(logsPathAbs);
		}

		log(`Unlink ${metaPathAbs}`);
		await unlink(metaPathAbs);
	}
}

async function removeLogsWithoutMeta(log) {
	log("Remove logs without meta file");

	const jobLogsDirAbs = resolve(Config.Paths.Logs, "jobs");
	const files = await readdir(jobLogsDirAbs, { withFileTypes: true });

	const logFiles = new Set();
	const metaFiles = new Set();

	for (const file of files) {
		if (file.isDirectory()) {
			continue;
		}

		if (file.name.endsWith(".meta")) {
			metaFiles.add(file.name.substring(0, file.name.length - 5));
		} else if (file.name.endsWith(".log")) {
			logFiles.add(file.name.substring(0, file.name.length - 4));
		}
	}

	for (const logName of logFiles.values()) {
		if (metaFiles.has(logName)) {
			continue;
		}

		log(`Removing ${logName}.log`);
		await unlink(resolve(jobLogsDirAbs, `${logName}.log`));
	}

}