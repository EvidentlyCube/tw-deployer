import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { ActionError } from "../utils/Errors.js";
import { isPortOpen } from "../utils/ExecUtils.js";
import { getWikiPackageJson } from "../utils/TwUtils.js";

export async function actionDetermineWikiPort(wikiPath, log) {
	log(`[Action: determine wiki path for ${wikiPath}`);

	const nginxPort = await extractPortFromNginx(wikiPath);
	if (nginxPort) {
		log(`Port found in nginx configuration: ${nginxPort}`);
		log("[/Action]");

		return nginxPort;
	}

	const packageJson = await getWikiPackageJson(wikiPath);
	if (packageJson.tiddlyWikiPath === wikiPath && packageJson.port) {
		log(`Port found in package.json: ${packageJson.port}`);
		log("[/Action]");

		return packageJson.port;
	}

	for (let i = 0; i < 500; i++) {
		const port = Config.TwPortCountFrom + i;

		if (await isPortOpen(port)) {
			log(`Found unused port ${port}`);
			log("[/Action]");

			return port;
		}
	}

	throw new ActionError(`Failed to determine port for ${wikiPath}`);
}

async function extractPortFromNginx(wikiPath) {
	const nginxConfig = await readFile(resolve(process.cwd(), Config.Paths.NginxConfig), "utf-8");

	const match = nginxConfig.match(new RegExp(`:(\\d+)\\/${wikiPath};`));

	if (match) {
		return parseInt(match[1]);
	}

	return false;
}