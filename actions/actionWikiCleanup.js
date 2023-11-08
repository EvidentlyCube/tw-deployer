import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";
import { rmTiddler, writeTiddler } from "../utils/TwUtils.js";

export async function actionWikiCleanup(wikiPath, log) {
	log(`[Action: cleanup TW story tiddlers and such ${wikiPath}`);

	const absWikiPath = getWikiAbsolutePath(wikiPath);

	const files = await readdir(resolve(absWikiPath, "wiki", "tiddlers"));
	const promises = [];

	for (const file of files) {
		if (file.startsWith("$__StoryList")) {
			promises.push(rmTiddler(wikiPath, file));
		}
	}

	promises.push(rmTiddler(wikiPath, "$__Import.tid"));
	promises.push(writeTiddler(wikiPath, "$__DefaultTiddlers.tid", { title: "$:/DefaultTiddlers", text: "[[TW Deployer Home]]" }));
	promises.push(writeTiddler(wikiPath, "TW DeployerHome.tid", getTwDeployerHomeTiddler()));

	await Promise.all(promises);

	log("[/Action]");
}

function getTwDeployerHomeTiddler() {
	return {
		title: "TW Deployer Home",
		text: [
			"! Hello!",
			"",
			"This wiki was created through TW Deployed. If this is a copy the following tiddlers were removed:",
			"",
			" * `$:/StoryList_XXX`",
			" * $:/Import",
			"",
			"Additionally:",
			"",
			" * $:/DefaultTiddlers was modified to point to this tiddler",
			" * $:/config/tiddlyweb/host was updated to a correct value to enabled syncing, please don't modify it unless you know what you're doing",
			"",
			"Feel free to update $:/DefaultTiddlers and delete this tiddler."
		].join("\n")
	};
}