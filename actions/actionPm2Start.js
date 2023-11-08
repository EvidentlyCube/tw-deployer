import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";
import { flushPm2Cache } from "../utils/pm2.js";

export async function actionPm2Start(wikiPath, log) {
	log(`[Action: start wiki '${wikiPath}' in PM2]`);

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);

	const { code } = await execPromiseLogged(`pm2 start ${wikiAbsolutePath}/pm2.json`, log);
	if (code) {
		throw new ActionError(`pm2 start responded with code: ${code}`);
	}

	flushPm2Cache();

	log("[/Action]");
}