import { backupWiki, loadBackups, loadPm2Status, loadWikiDetails, startWiki, stopWiki } from "./frontend.actions.js";
import { apiFetch } from "./frontend.api.js";
import { handleCopyWikiModal } from "./frontend.copyWikiModal.js";
import { createWiki } from "./frontend.createWiki.js";
import { deleteWiki } from "./frontend.deleteWiki.js";
import { dm } from "./frontend.dm.js";
import { getHtml } from "./frontend.getHtml.js";
import { getModalHtml } from "./frontend.getModalHtml.js";
import { setDisabled } from "./frontend.utils.js";

ready(async () => {
	Document.prototype.q = Document.prototype.querySelector;
	Document.prototype.qA = Document.prototype.querySelectorAll;
	Document.prototype.on = Document.prototype.addEventListener;
	Document.prototype.qOn = function (query, event, listener, options) {
		this.qA(query).forEach(element => element.addEventListener(event, listener, options));
	};
	Element.prototype.q = Element.prototype.querySelector;
	Element.prototype.qA = Element.prototype.querySelectorAll;
	Element.prototype.on = Element.prototype.addEventListener;
	Element.prototype.qOn = function (query, event, listener, options) {
		this.qA(query).forEach(element => element.addEventListener(event, listener, options));
	};

	const wikiPaths = await apiFetch("get-wikis");
	const $newTwForm = document.querySelector("#new-tw");

	await Promise.all(wikiPaths.sort().map(wikiPath => initializeWikiPath(wikiPath)));

	setDisabled(document, "#wiki-table button", false);
	setDisabled(document, "#modals button", false);

	$newTwForm.on("submit", e => {
		e.preventDefault();

		createWiki();
	});

	document.on("keydown", e => {
		if (e.key === "Escape") {
			document.querySelector("#modals").classList.remove("visible");
			document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("visible"));
		}
	});
});

async function initializeWikiPath(wikiPath) {
	const $templates = document.querySelector("#template");
	const $tableRows = document.q("#wiki-table tbody");
	const $modals = document.querySelector("#modals");

	$templates.appendChild(dm("option", { value: wikiPath, text: `/${wikiPath}` }));

	const $wikiRow = getHtml(wikiPath);
	const $wikiModal = getModalHtml(wikiPath);

	const loadAll = async () => {
		return Promise.all([
			await loadPm2Status(wikiPath, $wikiRow, $wikiModal),
			await loadWikiDetails(wikiPath, $wikiRow, $wikiModal),
			await loadBackups(wikiPath, $wikiModal),
		]);
	};

	$tableRows.appendChild($wikiRow);
	$modals.appendChild($wikiModal);

	$wikiRow.qOn(".action-show", "click", () => {
		$modals.classList.add("visible");
		$wikiModal.classList.add("visible");
	});

	$wikiRow.qOn(".action-refresh", "click", async () => {
		const $icon = $wikiRow.q(".action-refresh span");

		setDisabled($tableRows, "button", true);
		$icon.classList.add("animated");

		await loadAll();

		$icon.classList.remove("animated");
		setDisabled($tableRows, "button", false);
	});

	$wikiModal.qOn(".action-close", "click", () => {
		$modals.classList.remove("visible");
		$wikiModal.classList.remove("visible");
	});

	$wikiModal.qOn(".modal-action-backup", "click", () => {
		backupWiki(wikiPath, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-stop", "click", () => {
		stopWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-start", "click", () => {
		startWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-copy", "click", () => {
		$wikiModal.classList.remove("visible");
		handleCopyWikiModal(wikiPath);
	});

	$wikiModal.qOn(".modal-action-delete", "click", () => {
		alert("Please consider downloading a backup before deleting the wiki.");

		if (!confirm(`Are you sure you want to delete wiki ${wikiPath}? This operation cannot be undone`)) {
			return;
		}
		if (!confirm(`Final confirmation. Delete /${wikiPath}?`)) {
			return;
		}

		deleteWiki(wikiPath, $wikiRow, $wikiModal);
	});

	await loadAll();
}

function ready(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}