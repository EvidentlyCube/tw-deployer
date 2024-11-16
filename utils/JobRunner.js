import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { fileExists } from "./FileUtils.js";
import { createLogger } from "./Logger.js";
import { debugLog } from "./debugLog.js";

const jobs = new Map();

export async function startJob(name, callback) {
	debugLog(`Starting job ${name}`);
	const jobId = generateJobId();
	debugLog(`- ID = ${name}`);

	const jobInfo = {
		id: jobId,
		name: name,
		isFinished: false,
		isError: false,
		error: null,
		startedTimestamp: Date.now(),
		finishedTimestamp: null,
		logs: [],
	};

	jobs.set(jobId, jobInfo);

	const onLog = message => {
		console.log(message);
		jobInfo.logs.push({ on: Date.now(), log: message });
	};

	const logger = createLogger(`jobs/${jobId}.log`, { onLog });
	const metaPath = resolve(Config.Paths.Logs, "jobs", `${jobId}.meta`);
	debugLog(`- Meta Path = ${metaPath}`);

	const saveMeta = async () => {
		const meta = { ...jobInfo };
		delete meta.logs;

		debugLog(`Saving meta for job ${name} (${jobId})`);
		return writeFile(metaPath, JSON.stringify(meta), "utf-8");
	};

	await saveMeta();

	callback(logger).then(() => {
		jobInfo.finishedTimestamp = Date.now();
		jobInfo.isFinished = true;
	}).catch(error => {
		console.log(error);

		jobInfo.finishedTimestamp = Date.now();
		jobInfo.error = {
			message: error.message,
			stack: error.stack
		};
		jobInfo.isFinished = true;
		jobInfo.isError = true;
	}).then(saveMeta);

	return jobId;
}

export async function getJobInfo(jobId) {
	return jobs.get(jobId) ?? await loadJobInfo(jobId);
}

async function loadJobInfo(jobId) {
	debugLog(`loadJobInfo(${jobId})`)

	const jobLogsDirAbs = resolve(Config.Paths.Logs, "jobs");
	const jobMetaPathAbs = resolve(jobLogsDirAbs, `${jobId}.meta`);
	const jobLogsPathAbs = resolve(jobLogsDirAbs, `${jobId}.log`);

	debugLog(`- Meta path = ${jobMetaPathAbs}`)
	debugLog(`- Log path = ${jobLogsPathAbs}`)

	if (!await fileExists(jobMetaPathAbs) || !await fileExists(jobLogsPathAbs)) {
		return undefined;
	}

	try {
		const jobInfo = JSON.parse(await readFile(jobMetaPathAbs, "utf-8"));
		const logs = await readFile(jobLogsPathAbs, "utf-8");
		jobInfo.logs = logs.split("\n");

		jobs.set(jobId, jobInfo);

		return jobInfo;

	} catch (e) {
		debugLog(`- Erorr = ${String(e)}`);
		return undefined;
	}
}

function generateJobId() {
	return randomBytes(16).toString("hex");
}