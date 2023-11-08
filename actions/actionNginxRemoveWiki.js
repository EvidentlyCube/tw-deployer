import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";

export async function actionNginxRemoveWiki(wikiPath, log) {
	log(`[Action: remove wiki '${wikiPath}' from nginx config]`);

	const nginxConfigPath = resolve(process.cwd(), Config.Paths.NginxConfig);
	const nginxConfig = await readFile(nginxConfigPath, "utf-8");
	const updatedNginxConfig = nginxConfig.replace(getRemovalRegexp(wikiPath), "");

	await writeFile(nginxConfigPath, updatedNginxConfig, "utf8");

	log("[/Action]");
}

function getRemovalRegexp(wikiPath) {
	// return new RegExp(`location /${wikiPath}`);
	return new RegExp(`[ \\t]*location \\/${wikiPath}\\s*{[^}]+}\\n?`);
}