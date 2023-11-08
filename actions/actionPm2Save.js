import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { flushPm2Cache } from "../utils/pm2.js";

export async function actionPm2Save(log) {
	log("[Action: Save PM2]");

	const { code } = await execPromiseLogged("pm2 save", log);
	if (code) {
		throw new ActionError(`pm2 save responded with code: ${code}`);
	}

	flushPm2Cache();

	log("[/Action]");
}