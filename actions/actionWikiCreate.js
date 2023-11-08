import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { ActionError } from "../utils/Errors.js";
import { fileExists, isDirectory } from "../utils/FileUtils.js";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";

export async function actionWikiCreate(wikiPath, log) {
	log(`[Action: Creates wiki directory for ${wikiPath}`);

	const wikiPathAbs = getWikiAbsolutePath(wikiPath);

	if (!await fileExists(wikiPathAbs)) {
		await mkdir(wikiPathAbs);
	} else if (!await isDirectory(wikiPathAbs)) {
		throw new ActionError("Failed to create directory for the wiki as there is a file with its name already");
	}

	const wikiDirAbs = resolve(wikiPathAbs, "wiki");

	if (!await fileExists(wikiDirAbs)) {
		await mkdir(wikiDirAbs);
	} else if (!await isDirectory(wikiDirAbs)) {
		throw new ActionError("Failed to create subdirectory 'wiki' for the wiki as there is a file with its name already");
	}

	const tiddlersDirAbs = resolve(wikiPathAbs, "wiki", "tiddlers");

	if (!await fileExists(tiddlersDirAbs)) {
		await mkdir(tiddlersDirAbs);
	} else if (!await isDirectory(tiddlersDirAbs)) {
		throw new ActionError("Failed to create subdirectory 'wiki/tiddlers' for the wiki as there is a file with its name already");
	}

	await writeFile(resolve(wikiPathAbs, "wiki", "users.csv"), getUsersCsv(), "utf-8");
	await writeFile(resolve(wikiPathAbs, "wiki", "tiddlywiki.info"), JSON.stringify(getTiddlywikiInfo(), null, 4), "utf-8");

	log("[/Action]");
}

function getUsersCsv() {
	return "username,password\n"
		+ `${Config.Username},${Config.Password}\n`;
}

function getTiddlywikiInfo() {
	return {
		"description": "Basic client-server edition",
		"plugins": [
			"tiddlywiki/tiddlyweb",
			"tiddlywiki/filesystem",
			"tiddlywiki/highlight"
		],
		"themes": [
			"tiddlywiki/vanilla",
			"tiddlywiki/snowwhite"
		],
		"build": {
			"index": [
				"--render",
				"$:/plugins/tiddlywiki/tiddlyweb/save/offline",
				"index.html",
				"text/plain"
			],
			"static": [
				"--render",
				"$:/core/templates/static.template.html",
				"static.html",
				"text/plain",
				"--render",
				"$:/core/templates/alltiddlers.template.html",
				"alltiddlers.html",
				"text/plain",
				"--render",
				"[!is[system]]",
				"[encodeuricomponent[]addprefix[static/]addsuffix[.html]]",
				"text/plain",
				"--render",
				"$:/core/templates/static.template.css",
				"static/static.css",
				"text/plain"
			]
		}
	};
}