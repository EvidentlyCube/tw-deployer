import { writeTiddler } from "../utils/TwUtils.js";

export async function actionTiddlerUpdateTitle(wikiPath, title, log) {
	log(`[Action: update ${wikiPath} => $:/SiteTitle]`);

	await writeTiddler(wikiPath, "$__SiteTitle.tid", {
		title: "$:/SiteTitle",
		text: title
	});

	log("[/Action]");
}