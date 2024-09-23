import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";
import { getWikiPackageJson } from "../utils/TwUtils.js";
import Config from "../config.js";

export async function actionPreparePackageJson(wikiPath, port, log) {
	log(`[Action: insert run command into wiki '${wikiPath}' with port '${port}' in PM2]`);

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);
	const packageJsonPath = resolve(wikiAbsolutePath, "package.json");

	const packageJson = getWikiPackageJson(wikiPath, log);

	const tiddlyWikiHost = Config.Advanced?.TiddlyWikiHost ?? '127.0.0.1';

	packageJson.name = `tiddlywiki-${wikiPath}`;
	packageJson.description = `TiddlyWiki instance created with TW Deployer for path /${wikiPath}`;
	packageJson.version = "1.0.0";
	packageJson.port = port;
	packageJson.tiddlyWikiPath = wikiPath;

	packageJson.scripts = packageJson.scripts ?? {};
	packageJson.scripts.start = [
		"tiddlywiki",
		"wiki",
		"--listen",
		"credentials=users.csv",
		"\"readers=(authenticated)\"",
		"\"writers=(authenticated)\"",
		`host=${tiddlyWikiHost}`,
		`port=${port}`,
		`path-prefix=/${wikiPath}`
	].join(" ");

	await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4));
	log("[/Action]");
}