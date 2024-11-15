import { fixKnownProblems } from "./fixKnownProblems.js";
import { initializeScheduler } from "./scheduler/Scheduler.js";
import { registerScheduleNightlyBackupCleanup } from "./scheduler/scheduleBackupCleanup.js";
import { registerScheduleCleanupJobLogs } from "./scheduler/scheduleCleanupJobLogs.js";
import { registerScheduleNightlyBackups } from "./scheduler/scheduleNightlyBackups.js";
import { initServer } from "./server.js";
import { CoreLog } from "./utils/Logger.js";
import { initializeSharedRunner } from "./utils/SharedRunner.js";
import { validateConfig } from "./validateConfig.js";
import { validateServer } from "./validateServer.js";

bootstrap().catch(e => console.log(e));

async function bootstrap() {
	await validateConfig();
	await validateServer();

	CoreLog("server", "Starting server");

	registerScheduleNightlyBackups();
	registerScheduleNightlyBackupCleanup();
	registerScheduleCleanupJobLogs();
	initializeScheduler();

	initializeSharedRunner();

	await fixKnownProblems();

	await initServer();
}
