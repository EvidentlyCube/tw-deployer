import { cp, readFile, unlink, writeFile } from "node:fs/promises";
import { fileExists } from "../utils/FileUtils.js";
import { doNull } from "../utils/MiscUtils.js";
import { isValidWikiPath } from "../utils/PathUtils.js";
import { CoreLog } from "../utils/Logger.js";

let isStarted = false;
const registeredTasks = [];

export function registerSchedulerTask(taskId, name, getNextExecutionTime, action) {
	if (isStarted) {
		throw new Error("Cannot register new scheduler task when scheduler is running");
	}

	if (!isValidWikiPath(taskId)) {
		throw new Error(`'${taskId} is not a valid task ID`);
	}

	CoreLog("scheduler", `Registering task ${name} (${taskId})`);

	registeredTasks.push({
		id: taskId,
		name,
		getNextExecutionTime,
		action
	});
}

export function getSchedulerTasks() {
	return registeredTasks.map(({ id, name, startTimestamp }) => ({ id, name, startTimestamp }));
}

export async function runSchedulerTask(taskId, log) {
	const task = registeredTasks.find(task => task.id === taskId);

	if (!task) {
		throw new Error(`Scheduler task '${taskId}' not found`);
	}

	await task.action(log);
}

export async function initializeScheduler() {
	const storedStartTimes = await readTaskStartTimes();

	for (const task of registeredTasks) {
		task.startTimestamp = storedStartTimes[task.name]
			?? task.getNextExecutionTime();
	}

	runTasks();
}

async function runTasks() {
	for (const task of registeredTasks) {
		if (task.startTimestamp <= Date.now()) {
			await task.action(doNull);
			task.startTimestamp = task.getNextExecutionTime();

			if (task.startTimestamp <= Date.now()) {
				throw new Error(`Scheduler task ${task.name} scheduled next execution immediately or in the past, that is not allowed`);
			}

			await storeTaskStartTimes();
		}
	}

	// Run every minute
	setTimeout(runTasks, 60 * 1000);
}


async function readTaskStartTimes() {
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

async function storeTaskStartTimes() {
	const data = {};

	registeredTasks.forEach(task => {
		data[task.name] = task.startTimestamp;
	});

	if (await fileExists(".scheduler.bak")) {
		await unlink(".scheduler.bak");
	}

	await cp(".scheduler", ".scheduler.bak");
	await writeFile(".scheduler", JSON.stringify(data), "utf-8");
	await unlink(".scheduler.bak");
}