import { writeFile } from "node:fs/promises";
import Config from "../config.js";
import { getTiddlerAbsolutePath } from "../utils/PathUtils.js";
import { createTiddlerContent } from "../utils/TwUtils.js";

export async function actionTiddlerUpdateHost(wikiPath, log) {
	log("[Action: update $:/config/tiddlyweb/host]");

	const newFile = createTiddlerContent({
		title: "$:/config/tiddlyweb/host",
		text: `${Config.Hostname}/${wikiPath}/`
	});

	await writeFile(
		getTiddlerAbsolutePath(wikiPath, "$__config_tiddlyweb_host.tid"),
		newFile,
		"utf8"
	);

	log("[/Action]");
}