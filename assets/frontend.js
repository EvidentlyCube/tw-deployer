import { loadPm2Status, loadWikiDetails } from "./frontend.actions.js";
import { apiFetch } from "./frontend.api.js";
import { createWiki } from "./frontend.createWiki.js";
import { dm } from "./frontend.dm.js";
import { getHtml as getWikiCardHtml } from "./frontend.getHtml.js";

ready(async () => {
	const wikiPaths = await apiFetch("get-wikis");

	const $templates = document.querySelector("#template");
	const $newTwForm = document.querySelector("#new-tw");

	wikiPaths.sort().forEach(async wikiPath => {
		$templates.appendChild(dm("option", { value: wikiPath, text: `/${wikiPath}` }));

		const $wikiCard = getWikiCardHtml(wikiPath);

		document.querySelector("#wiki-cards").appendChild($wikiCard);

		await loadPm2Status(wikiPath, $wikiCard);
		await loadWikiDetails(wikiPath, $wikiCard);
	});

	$newTwForm.addEventListener("submit", e => {
		e.preventDefault();

		createWiki();
	});

});

function ready(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}