import { CONFIG_isPm2Enabled } from "../utils/ConfigUtils.js";
import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { flushPm2Cache } from "../utils/pm2.js";

export async function actionPm2Save(log) {
	log("[Action: Save PM2]");

	if (CONFIG_isPm2Enabled()) {
		const { code } = await execPromiseLogged("pm2 save", log);
		if (code) {
			throw new ActionError(`pm2 save responded with code: ${code}`);
		}

		flushPm2Cache();
	} else {
		log("PM2 is disabled, skipping")
	}

	log("[/Action]");
}