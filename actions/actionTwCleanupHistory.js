import { writeFile } from "node:fs/promises";
import { getTiddlerAbsolutePath } from "../utils/PathUtils.js";
import { createTiddlerContent } from "../utils/TwUtils.js";

export async function actionTwUpdateTitle(wikiPath, title, log) {
	log(`[Action: cleanup TW history ${wikiPath} => $:/SiteTitle]`);

	const tiddlerContent = createTiddlerContent({
		title: "$:/SiteTitle",
		text: title
	});

	await writeFile(
		getTiddlerAbsolutePath(wikiPath, "$__SiteTItle.tid"),
		tiddlerContent,
		"utf8"
	);

	log("[/Action]");
}