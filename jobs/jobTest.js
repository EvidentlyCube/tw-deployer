import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiAction, acquireLock, releaseLock } from "../utils/LockUtils.js";

export async function startJobTest(
	duration
) {
	if (!acquireLock(LockTypeWikiAction)) {
		throw Error("Server is busy processing wiki action, please wait for the operation to finish.");
	}

	try {
		return startJob(
			"Test",
			log => runJob(log, duration)
		);

	} finally {
		releaseLock(LockTypeWikiAction);
	}
}


async function runJob(log, duration) {
	log("Job started");

	const stopAfter = Date.now() + duration;

	while (Date.now() < stopAfter) {
		log("150ms passed " + Math.random());
		await sleep(150);
	}

	log("Job finished");
}

export async function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(resolve, duration);
	});
}
