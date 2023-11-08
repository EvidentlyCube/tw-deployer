import { rm } from "node:fs/promises";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";

export async function actionWikiDelete(wikiPath, log) {
	log(`[Action: delete wiki '${wikiPath}']`);

	const wikiPathAbs = getWikiAbsolutePath(wikiPath);

	await rm(wikiPathAbs, { recursive: true });

	log("[/Action]");
}