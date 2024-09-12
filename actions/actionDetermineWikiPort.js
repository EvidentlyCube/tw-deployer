import { ActionError } from "../utils/Errors.js";
import { findUnusedPort } from "../utils/PortUtils.js";
import { getWikiNginxPort, getWikiPackageJsonPort } from "../utils/WikiUtils.js";

export async function actionDetermineWikiPort(wikiPath, log) {
	log(`[Action: determine wiki port for ${wikiPath}`);

	const nginxPort = await getWikiNginxPort(wikiPath);
	if (nginxPort) {
		log(`Port found in nginx configuration: ${nginxPort}`);
		log("[/Action]");

		return nginxPort;
	}

	const packageJsonPort = await getWikiPackageJsonPort(wikiPath);
	if (packageJsonPort) {
		log(`Port found in package.json: ${packageJsonPort}`);
		log("[/Action]");

		return packageJsonPort;
	}

	const emptyPort = await findUnusedPort();

	if (emptyPort) {
		log(`Found unused port ${emptyPort}`);
		log("[/Action]");
	}

	throw new ActionError(`Failed to determine port for ${wikiPath}`);
}