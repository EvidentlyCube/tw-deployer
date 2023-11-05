import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";

export async function actionCopyWiki(source, target, log) {
	log(`[Action: copy wiki (From=${source}, To=${target})]`);

	const sourceAbsPath = getWikiAbsolutePath(source);
	const targetAbsPath = getWikiAbsolutePath(target);

	const { code } = await execPromiseLogged(`cp -rf '${sourceAbsPath}' '${targetAbsPath}'`, log);

	if (code) {
		throw new ActionError(`Failed to copy wiki From=${source} To=${target}`);
	}

	log("[/Action]");
}