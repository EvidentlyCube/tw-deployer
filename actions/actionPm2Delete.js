import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { flushPm2Cache, getPm2WikiName } from "../utils/pm2.js";

export async function actionPm2Delete(wikiPath, log) {
	log(`[Action: delete wiki '${wikiPath}' in PM2]`);

	const pm2WikiName = getPm2WikiName(wikiPath);

	const { code: deleteCode, stderr: deleteStdErr } = await execPromiseLogged(`pm2 delete '${pm2WikiName}'`, log);
	if (deleteCode && !deleteStdErr.includes("not found")) {
		throw new ActionError(`pm2 delete responded with code: ${deleteCode}`);
	}

	flushPm2Cache();

	log("[/Action]");
}