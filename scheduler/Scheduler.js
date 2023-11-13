import { cp, readFile, unlink, writeFile } from "node:fs/promises";
import { fileExists } from "../utils/FileUtils.js";
import { doNull } from "../utils/MiscUtils.js";
import { isValidWikiPath } from "../utils/PathUtils.js";

let isStarted = false;
const registeredJobs = [];

export function registerSchedulerJob(id, name, getNextExecutionTime, action) {
	if (isStarted) {
		throw new Error("Cannot register new scheduler jobs when scheduler is running");
	}

	if (!isValidWikiPath(id)) {
		throw new Error(`'${id} is not a valid job ID`);
	}

	registeredJobs.push({
		id,
		name,
		getNextExecutionTime,
		action
	});
}

export function getSchedulerJobs() {
	return registeredJobs.map(({id, name, startTimestamp}) => ({id, name, startTimestamp}));
}

export async function runSchedulerJob(jobId, log) {
	const job = registeredJobs.find(job => job.id === jobId);

	if (!job) {
		throw new Error(`Job '${jobId}' not found`);
	}

	await job.action(log);
}

export async function initializeScheduler() {
	const storedStartTimes = await readJobStartTimes();

	for (const job of registeredJobs) {
		job.startTimestamp = storedStartTimes[job.name]
			?? job.getNextExecutionTime();
	}

	runJobs();
}

async function runJobs() {
	for (const job of registeredJobs) {
		if (job.startTimestamp <= Date.now()) {
			await job.action(doNull);
			job.startTimestamp = job.getNextExecutionTime();

			if (job.startTimestamp <= Date.now()) {
				throw new Error(`Scheduler job ${job.name} scheduled next execution immediately or in the past, that is not allowed`);
			}

			await storeJobStartTimes();
		}
	}

	// Run every minute
	setTimeout(runJobs, 60 * 1000);
}


async function readJobStartTimes() {
	try {
		if (await fileExists(".scheduler")) {
			return JSON.parse(await readFile(".scheduler", "utf-8"));
		}
	} catch (e) {
		// Ignore
	}

	try {
		if (await fileExists(".scheduler.bak")) {
			return JSON.parse(await readFile(".scheduler.bak", "utf-8"));
		}
	} catch (e) {
		// Ignore
	}

	return {};
}

async function storeJobStartTimes() {
	const data = {};

	registeredJobs.forEach(job => {
		data[job.name] = job.startTimestamp;
	});

	if (await fileExists(".scheduler.bak")) {
		await unlink(".scheduler.bak");
	}

	await cp(".scheduler", ".scheduler.bak");
	await writeFile(".scheduler", JSON.stringify(data), "utf-8");
	await unlink(".scheduler.bak");
}