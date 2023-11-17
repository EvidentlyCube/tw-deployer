import { randomBytes } from "node:crypto";
import { createLogger } from "./Logger.js";
import { resolve } from "node:path";
import Config from "../config.js";
import { writeFile } from "node:fs/promises";

const jobs = new Map();

export async function startJob(name, callback) {
	const jobId = generateJobId();
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

	const saveMeta = async () => {
		const meta = {...jobInfo};
		delete meta.logs;

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

export function getJobInfo(id) {
	return jobs.get(id);
}

function generateJobId() {
	return randomBytes(16).toString("hex");
}