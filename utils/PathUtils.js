import { resolve } from "node:path";
import Config from "../config.js";

const MaxAllowedWikiPath = 64;
const AllowedCharacters = /^[a-z0-9-]+$/;

export function isValidWikiPath(wikiPath) {
	return wikiPath.length > 0
		&& wikiPath.length <= MaxAllowedWikiPath
		&& AllowedCharacters.test(wikiPath);
}

export function isSafePath(path) {
	return !path.includes("\\") && !path.includes("/") && !path.includes("..");
}

export function getWikiAbsolutePath(wikiPath) {
	return resolve(process.cwd(), Config.Paths.Wikis, wikiPath);
}

export function getWikiBackupsAbsolutePath(wikiPath) {
	return resolve(process.cwd(), Config.Paths.Backups, wikiPath);
}

export function getTiddlerAbsolutePath(wikiPath, tiddlerFilename) {
	return resolve(
		getWikiAbsolutePath(wikiPath),
		"wiki",
		"tiddlers",
		tiddlerFilename
	);
}