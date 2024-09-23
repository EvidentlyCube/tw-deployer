import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";

export async function actionNginxAddWiki(wikiPath, port, log) {
	log(`[Action: add wiki '${wikiPath}' to nginx config]`);

	const configFileName = `${port}.${wikiPath}`;
	const configAbsPath = resolve(process.cwd(), Config.Paths.NginxConfigDir, configFileName);

	log(`Writing new nginx config to ${configAbsPath}`);
	await writeFile(configAbsPath, getNewEntry(wikiPath, port));

	log("[/Action]");
}

function getNewEntry(wikiPath, port) {
	const host = Config.Advanced?.NginxHost ?? 'http://127.0.0.1'
	return [
		`location /${wikiPath} {`,
		`    proxy_pass              ${host}:${port}/${wikiPath};`,
		"    proxy_set_header        Host             $host;",
		"    proxy_set_header        X-Real-IP        $remote_addr;",
		"    proxy_set_header        X-Forwarded-For  $proxy_add_x_forwarded_for;",
		"}",
	].join("\n");
}