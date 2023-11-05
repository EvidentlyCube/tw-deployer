import { initServer } from "./server.js";
import { validateConfig } from "./validateConfig.js";

bootstrap();

async function bootstrap() {
	await validateConfig();
	await initServer();
}