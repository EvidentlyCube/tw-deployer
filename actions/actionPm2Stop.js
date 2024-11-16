import { CONFIG_isPm2Enabled } from "../utils/ConfigUtils.js";
import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { flushPm2Cache, getPm2WikiName } from "../utils/pm2.js";

export async function actionPm2Stop(wikiPath, log) {
	log(`[Action: stop wiki '${wikiPath}' in PM2]`);

	if (CONFIG_isPm2Enabled()) {
		const pm2WikiName = getPm2WikiName(wikiPath);

		const { code: deleteCode, stderr: deleteStdErr } = await execPromiseLogged(`pm2 stop '${pm2WikiName}'`, log);
		if (deleteCode && !deleteStdErr.includes("not found")) {
			throw new ActionError(`pm2 stop responded with code '${deleteCode}' and error: ${deleteStdErr}`);
		}

		flushPm2Cache();
	} else {
		log("PM2 is disabled, skipping")
	}

	log("[/Action]");
}