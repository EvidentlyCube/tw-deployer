import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";

export async function getWikiPaths() {
	return await readdir(resolve(process.cwd(), Config.Paths.Wikis));
}