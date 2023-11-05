import { resolve } from "node:path";
import Config from "../config.js";

const allowedCharacters = /$[a-z0-9-]+^/;
export async function isValidWikiPath(wikiPath) {
	return allowedCharacters.test(wikiPath);
}

export function getWikiAbsolutePath(wikiPath) {
	return resolve(process.cwd(), Config.Paths.Wikis, wikiPath);
}

export function getTiddlerAbsolutePath(wikiPath, tiddlerFilename) {
	return resolve(
		getWikiAbsolutePath(wikiPath),
		"wiki",
		"tiddlers",
		tiddlerFilename
	);
}