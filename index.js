import { initializeScheduler } from "./scheduler/Scheduler.js";
import { registerScheduleNightlyBackupCleanup } from "./scheduler/scheduleBackupCleanup.js";
import { registerScheduleCleanupJobLogs } from "./scheduler/scheduleCleanupJobLogs.js";
import { registerScheduleNightlyBackups } from "./scheduler/scheduleNightlyBackups.js";
import { initServer } from "./server.js";
import { initializeSharedRunner } from "./utils/SharedRunner.js";
import { validateConfig } from "./validateConfig.js";
import { validateServer } from "./validateServer.js";

bootstrap().catch(e => console.log(e));

async function bootstrap() {
	await validateServer();
	await validateConfig();

	registerScheduleNightlyBackups();
	registerScheduleNightlyBackupCleanup();
	registerScheduleCleanupJobLogs();
	initializeScheduler();

	initializeSharedRunner();

	await initServer();
}
