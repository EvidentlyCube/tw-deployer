import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiAction, acquireLock, releaseLock } from "../utils/LockUtils.js";

export async function startJobTest(
	duration,
	crash
) {
	if (!acquireLock(LockTypeWikiAction)) {
		throw Error("Server is busy processing wiki action, please wait for the operation to finish.");
	}

	try {
		return startJob(
			"Test",
			log => runJob(log, duration, crash)
		);

	} finally {
		releaseLock(LockTypeWikiAction);
	}
}


async function runJob(log, duration, crash) {
	log("Job started");

	const stopAfter = Date.now() + duration;

	while (Date.now() < stopAfter) {
		log("500ms passed " + Math.random());
		await sleep(200);
		log("[action test]");
		await sleep(200);
		log("CODE=Quack");
		log("Executing: something");
		await sleep(200);
		log("[/action]");

		await sleep(500);
	}

	if (crash) {
		throw new Error("A synthetic crash has occurred");
	}

	log("Job finished");
}

export async function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(resolve, duration);
	});
}
