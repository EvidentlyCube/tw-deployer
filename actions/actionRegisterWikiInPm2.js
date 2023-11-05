import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";

export async function actionRegisterWikiInPm2(wikiPath, log) {
	log(`[Action: register wiki '${wikiPath}' in PM2]`);

	const { code: deleteCode, stderr: deleteStdErr } = await execPromiseLogged(`pm2 delete "Tiddlywiki /${wikiPath}"`, log);
	if (deleteCode && !deleteStdErr.includes("not found")) {
		throw new ActionError(`pm2 delete responded with code: ${deleteCode}`);
	}

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);

	const command = `pm2 start ${wikiAbsolutePath}/pm2.json`;

	const { code: startCode } = await execPromiseLogged(command, log);
	if (startCode) {
		throw new ActionError(`pm2 start responded with code: ${startCode}`);
	}

	const { code: saveCode } = await execPromiseLogged("pm2 save", log);
	if (saveCode) {
		throw new ActionError(`pm2 save responded with code: ${saveCode}`);
	}

	log("[/Action]");
}