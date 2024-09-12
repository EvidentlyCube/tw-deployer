import { backupWiki, loadBackups, loadPm2Status, loadWikiDetails, registerSharedWiki, startWiki, stopWiki } from "./frontend.actions.js";
import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { deleteWiki } from "./frontend.deleteWiki.js";
import { getHtml } from "./frontend.getHtml.js";
import { getJobsRowHtml } from "./frontend.getJobsRowHtml.js";
import { getModalHtml } from "./frontend.getModalHtml.js";
import { getSchedulerRowHtml } from "./frontend.getSchedulerRowHtml.js";
import { trackJob } from "./frontend.jobs.js";
import { handleCopyWikiModal } from "./frontend.modalCopyWiki.js";
import { handleCreateWikiModal } from "./frontend.modalCreateWiki.js";
import { handleEditUsersModal } from "./frontend.modalEditUsers.js";
import { handleUploadWikiModal } from "./frontend.modalUploadWiki.js";
import { addSpinner, formatSize, hideModals, setButtonsDisabled, setDisabled, showModal } from "./frontend.utils.js";

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

	const wikiPaths = await apiFetch("wiki/summary");

	await Promise.all([
		loadScheduler(),
		loadJobLogs(),
		loadMemory(),
		...wikiPaths.sort().map(wikiPath => initializeWikiPath(wikiPath))
	]);

	setDisabled(document, "#wiki-table button", false);
	setDisabled(document, "#modals button", false);

	setTimeout(() => {
		document.body.classList.remove("no-transition");
	}, 200);

	document.qOn("#action-create-wiki", "click", () => handleCreateWikiModal());
	document.qOn("#action-upload-wiki", "click", () => handleUploadWikiModal());

	document.on("keydown", e => {
		if (e.key === "Escape") {
			hideModals();
		}
	});

	document.on("tw-deployer:refresh-jobs", () => loadJobLogs());
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

	$wikiModal.qOn(".modal-action-start-shared", "click", () => {
		registerSharedWiki(wikiPath, $wikiRow, $wikiModal);
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

async function loadMemory() {
	const result = await apiFetch("system/memory");

	const $ramValue = document.q("#stats .stat-ram .value");
	const $hdValue = document.q("#stats .stat-hd .value");

	{ // RAM
		const { available, total } = result.memory;
		const used = total - available;
		const usedPercent = (used / total) * 100;

		$ramValue.innerText = `${formatSize(used, undefined, 1)} / ${formatSize(total, undefined, 1)} (${usedPercent.toFixed(2)}%)`;
	}
	{ // HD
		const { available, total } = result.disk;
		const used = total - available;
		const usedPercent = (used / total) * 100;

		$hdValue.innerText = `${formatSize(used, undefined, 1)} / ${formatSize(total, undefined, 1)} (${usedPercent.toFixed(2)}%)`;
	}
}

async function loadScheduler() {
	const $scheduler = document.q("#scheduler-table tbody");
	const tasks = await apiFetch("scheduler/tasks");

	for (const task of tasks) {
		const $row = getSchedulerRowHtml(task.id, task.name, task.startTimestamp);
		$scheduler.appendChild($row);

		$row.qOn(".action-run-job", "click", async () => {
			if (!confirm(`Are you sure you want to run scheduler task '${task.name}'?`)) {
				return;
			}

			const $button = $row.q("button");
			addSpinner($button);
			setButtonsDisabled(document, true);

			const csrf = await apiFetch("csrf/generate");
			const jobId = await apiFetchPost(`scheduler/run/${task.id}`, { csrf });
			console.log(jobId);

			if (getLastApiError()) {
				alert(`Operation failed: ${getLastApiError()}`);
				return false;
			}

			await trackJob(jobId, task.name);

			window.location.reload();
		});
	}
}

async function loadJobLogs() {
	const $jobsTable = document.q("#job-logs-table tbody");
	const jobs = await apiFetch("jobs/summary");

	jobs.sort((l, r) => r.startedTimestamp - l.startedTimestamp);

	$jobsTable.innerHTML = "";

	for (const job of jobs) {
		const $row = getJobsRowHtml(job.name, job.startedTimestamp);
		$jobsTable.appendChild($row);

		$row.qOn(".action-show-logs", "click", async (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();

			trackJob(
				job.id,
				`${job.name} [Past Logs]`,
				{ preventJobRefresh: true }
			);
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