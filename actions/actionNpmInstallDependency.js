import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";

export async function actionNpmInstallDependency(wikiPath, dependency, log) {
	log(`[Action: install npm dependency '${dependency} in wiki '${wikiPath}']`);

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);

	const { code, stderr } = await execPromiseLogged(`npm i tiddlywiki --save --prefix '${wikiAbsolutePath}'`, log);
	if (code) {
		throw new ActionError(`NPM responded with error: ${stderr}`);
	}

	log("[/Action]");
}