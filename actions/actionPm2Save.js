import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";

export async function actionPm2Save(log) {
	log("[Action: Save PM2]");

	const { code } = await execPromiseLogged("pm2 save", log);
	if (code) {
		throw new ActionError(`pm2 save responded with code: ${code}`);
	}

	log("[/Action]");
}