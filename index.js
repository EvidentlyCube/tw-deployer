import { initServer } from "./server.js";
import { validateConfig } from "./validateConfig.js";

bootstrap().catch(e => console.log(e));

async function bootstrap() {
	await validateConfig();
	await initServer();
}