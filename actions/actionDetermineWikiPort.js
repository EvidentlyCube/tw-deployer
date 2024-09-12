import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { ActionError } from "../utils/Errors.js";
import { getUsedPorts, isPortOpen } from "../utils/ExecUtils.js";
import { getValidPorts } from "../utils/PortUtils.js";
import { getWikiPackageJson } from "../utils/TwUtils.js";

export async function actionDetermineWikiPort(wikiPath, log) {
	log(`[Action: determine wiki port for ${wikiPath}`);

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

	const validPorts = getValidPorts();
	const usedPorts = await getUsedPorts();

	for (const port of validPorts) {
		if (!usedPorts.has(port)) {

			if (await isPortOpen(port)) {
				log(`Found unused port ${port}`);
				log("[/Action]");

				return port;
			}
		}
	}

	throw new ActionError(`Failed to determine port for ${wikiPath}`);
}

async function extractPortFromNginx(wikiPath) {
	const fileNames = await readdir(resolve(process.cwd(), Config.Paths.NginxConfigDir), "utf-8");

	for (const fileName of fileNames) {
		const bits = fileName.split(".");

		if (bits.length === 2 && bits[1] === wikiPath && Number.isInteger(parseFloat(bits[0]))) {
			return parseFloat(bits[0]);
		}
	}

	return false;
}