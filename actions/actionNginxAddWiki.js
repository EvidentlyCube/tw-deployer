import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";

export async function actionNginxAddWiki(wikiPath, port, log) {
	log(`[Action: add wiki '${wikiPath}' to nginx config]`);

	log("Loading nginx config");
	const nginxConfig = await readFile(resolve(process.cwd(), Config.Paths.NginxConfig), "utf-8");

	if (!nginxConfig.includes(`location /${wikiPath} {`)) {
		log(`Missing nginx config for /${wikiPath}`);

		const addedTemplate = getNewEntry(wikiPath, port);

		const newNginxConfig = nginxConfig.replace(
			"location / {",
			addedTemplate + "\n    location / {"
		);

		log("Writing updated nginx config");
		await writeFile(Config.Paths.NginxConfig, newNginxConfig, "utf-8");
	}

	log("[/Action]");
}

function getNewEntry(wikiPath, port) {
	return [
		`location /${wikiPath} {`,
		`        proxy_pass              http://127.0.0.1:${port}/${wikiPath};`,
		"        proxy_set_header        Host             $host;",
		"        proxy_set_header        X-Real-IP        $remote_addr;",
		"        proxy_set_header        X-Forwarded-For  $proxy_add_x_forwarded_for;",
		"    }",
	].join("\n");
}