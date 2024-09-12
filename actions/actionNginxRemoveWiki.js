import { rm } from "node:fs/promises";
import { findNginxConfigPath } from "../utils/NginxUtils.js";

export async function actionNginxRemoveWiki(wikiPath, log) {
	log(`[Action: remove wiki '${wikiPath}' from nginx config]`);

	const path = findNginxConfigPath(wikiPath);

	if (path) {
		rm(path);
	}

	log("[/Action]");
}