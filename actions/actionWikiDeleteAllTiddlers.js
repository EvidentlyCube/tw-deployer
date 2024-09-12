import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";

export async function actionWikiDeleteAllTiddlers(wikiPath, log) {
	log(`[Action: delete all tiddlers from wiki '${wikiPath}']`);

	const tiddlersPath = resolve(
		getWikiAbsolutePath(wikiPath),
		"wiki",
		"tiddlers"
	);

	log(`Delete path '${tiddlersPath}'`);
	await rm(tiddlersPath, { recursive: true });
	log(`Create empty directory '${tiddlersPath}`);
	await mkdir(tiddlersPath);

	log("[/Action]");
}