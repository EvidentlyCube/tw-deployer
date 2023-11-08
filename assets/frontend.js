import { backupWiki, loadBackups, loadPm2Status, loadWikiDetails, startWiki, stopWiki } from "./frontend.actions.js";
import { apiFetch } from "./frontend.api.js";
import { createWiki } from "./frontend.createWiki.js";
import { deleteWiki } from "./frontend.deleteWiki.js";
import { dm } from "./frontend.dm.js";
import { getHtml } from "./frontend.getHtml.js";
import { getModalHtml } from "./frontend.getModalHtml.js";

ready(async () => {
	const wikiPaths = await apiFetch("get-wikis");

	const $newTwForm = document.querySelector("#new-tw");

	wikiPaths.sort().forEach(wikiPath => initializeWikiPath(wikiPath));

	$newTwForm.addEventListener("submit", e => {
		e.preventDefault();

		createWiki();
	});

	document.addEventListener("keydown", e => {
		if (e.key === "Escape") {
			document.querySelector("#modals").classList.remove("visible");
			document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("visible"));
		}
	});
});

async function initializeWikiPath(wikiPath) {
	const $templates = document.querySelector("#template");
	const $modals = document.querySelector("#modals");

	$templates.appendChild(dm("option", { value: wikiPath, text: `/${wikiPath}` }));

	const $wikiRow = getHtml(wikiPath);
	const $wikiModal = getModalHtml(wikiPath);

	document.querySelector("#wiki-table tbody").appendChild($wikiRow);
	document.querySelector("#modals").appendChild($wikiModal);

	$wikiRow.querySelector(".action-show").addEventListener("click", () => {
		$modals.classList.add("visible");
		$wikiModal.classList.add("visible");
	});

	$wikiModal.querySelector(".action-close").addEventListener("click", () => {
		$modals.classList.remove("visible");
		$wikiModal.classList.remove("visible");
	});

	$wikiModal.querySelector(".modal-action-backup").addEventListener("click", () => {
		backupWiki(wikiPath, $wikiModal);
	});

	$wikiModal.querySelector(".modal-action-stop").addEventListener("click", () => {
		stopWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.querySelector(".modal-action-start").addEventListener("click", () => {
		startWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.querySelector(".modal-action-delete").addEventListener("click", () => {
		alert("Please consider downloading a backup before deleting the wiki.");

		if (!confirm(`Are you sure you want to delete wiki ${wikiPath}? This operation cannot be undone`)) {
			return;
		}
		if (!confirm(`Final confirmation. Delete /${wikiPath}?`)) {
			return;
		}

		deleteWiki(wikiPath, $wikiRow, $wikiModal);
	});

	await loadPm2Status(wikiPath, $wikiRow, $wikiModal);
	await loadWikiDetails(wikiPath, $wikiRow, $wikiModal);
	await loadBackups(wikiPath, $wikiModal);

	$wikiModal.querySelectorAll("button").forEach(button => button.disabled = false);
}

function ready(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}