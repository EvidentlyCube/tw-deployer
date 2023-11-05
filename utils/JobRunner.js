import { randomBytes } from "node:crypto";
import { createLogger } from "./Logger.js";

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
		jobInfo.logs.push(message);
	};

	const logger = createLogger(`jobs/${jobId}.log`, { onLog });

	callback(logger).then(() => {
		jobInfo.finishedTimestamp = Date.now();
		jobInfo.isFinished = true;
	}).catch(error => {
		jobInfo.finishedTimestamp = Date.now();
		jobInfo.error = {
			message: error.message,
			stack: error.stack
		};
		jobInfo.isFinished = true;
		jobInfo.isError = true;
	});

	return jobId;
}

export function getJobInfo(id) {
	return jobs.get(id);
}

function generateJobId() {
	return randomBytes(16).toString("hex");
}