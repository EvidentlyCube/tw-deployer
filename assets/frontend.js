import { backupWiki, loadBackups, loadPm2Status, loadWikiDetails, startWiki, stopWiki } from "./frontend.actions.js";
import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { deleteWiki } from "./frontend.deleteWiki.js";
import { getHtml } from "./frontend.getHtml.js";
import { getModalHtml } from "./frontend.getModalHtml.js";
import { getSchedulerRowHtml } from "./frontend.getSchedulerRowHtml.js";
import { handleCopyWikiModal } from "./frontend.modalCopyWiki.js";
import { handleCreateWikiModal } from "./frontend.modalCreateWiki.js";
import { handleEditUsersModal } from "./frontend.modalEditUsers.js";
import { addSpinner, hideModals, removeSpinner, setButtonsDisabled, setDisabled, showModal, sleep } from "./frontend.utils.js";

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


	await Promise.all([
		loadScheduler(),
		...wikiPaths.sort().map(wikiPath => initializeWikiPath(wikiPath))
	]);

	setDisabled(document, "#wiki-table button", false);
	setDisabled(document, "#modals button", false);

	setTimeout(() => {
		document.body.classList.remove("no-transition");
	}, 200);

	document.qOn("#action-create-wiki", "click", () => handleCreateWikiModal());

	document.on("keydown", e => {
		if (e.key === "Escape") {
			hideModals();
		}
	});
});

async function initializeWikiPath(wikiPath) {
	const $tableRows = document.q("#wiki-table tbody");
	const $modals = document.querySelector("#modals");

	const $wikiRow = getHtml(wikiPath);
	const $wikiModal = getModalHtml(wikiPath);

	const loadAll = async () => {
		return Promise.all([
			loadPm2Status(wikiPath, $wikiRow, $wikiModal),
			loadWikiDetails(wikiPath, $wikiRow, $wikiModal),
			loadBackups(wikiPath, $wikiRow, $wikiModal),
		]);
	};

	$tableRows.appendChild($wikiRow);
	$modals.appendChild($wikiModal);

	$wikiRow.qOn(".action-show", "click", () => {
		showModal($wikiModal);
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
		hideModals();
	});

	$wikiModal.qOn(".modal-action-backup", "click", () => {
		backupWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-stop", "click", () => {
		stopWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-start", "click", () => {
		startWiki(wikiPath, $wikiRow, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-copy", "click", () => {
		hideModals();
		handleCopyWikiModal(wikiPath, $wikiModal);
	});

	$wikiModal.qOn(".modal-action-edit-users", "click", () => {
		handleEditUsersModal(wikiPath, $wikiModal);
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

async function loadScheduler() {
	const $scheduler = document.q("#scheduler-table tbody");
	const jobs = await apiFetch("scheduler/jobs");

	for (const job of jobs) {
		const $row = getSchedulerRowHtml(job.id, job.name, job.startTimestamp);
		$scheduler.appendChild($row);

		$row.on("click", async () => {
			if (!confirm(`Are you sure you want to run scheduler job '${job.name}'?`)) {
				return;
			}

			const $button = $row.q("button");
			addSpinner($button);
			setButtonsDisabled(document, true);

			const csrf = await apiFetch("csrf-token");
			await apiFetchPost(`scheduler/run-job/${job.id}`, { csrf });

			removeSpinner($button);
			setButtonsDisabled(document, false);

			if (getLastApiError()) {
				alert(getLastApiError());
			} else {
				// window.location.reload();
			}
		});
	}
}

function ready(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}