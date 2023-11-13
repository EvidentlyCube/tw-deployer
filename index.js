import { initializeScheduler } from "./scheduler/Scheduler.js";
import { registerScheduleNightlyBackups } from "./scheduler/scheduleNightlyBackups.js";
import { initServer } from "./server.js";
import { validateConfig } from "./validateConfig.js";

bootstrap().catch(e => console.log(e));

async function bootstrap() {
	await validateConfig();

	registerScheduleNightlyBackups();
	initializeScheduler();

	await initServer();
}
