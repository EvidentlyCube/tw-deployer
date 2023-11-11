import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { dm } from "./frontend.dm.js";
import { createBackupRowHtml } from "./frontend.getModalHtml.js";
import { trackJob } from "./frontend.jobs.js";
import { addSpinner, formatDate, formatSize, hideButton, removeElements, removeSpinner, setDisabled, showButton } from "./frontend.utils.js";

export async function loadPm2Status(wikiPath, $wikiRow, $wikiModal) {
	const $statusCell = $wikiRow.querySelector(".cell-status");
	const $memoryCell = $wikiRow.querySelector(".cell-memory");

	const $modalPID = $wikiModal.querySelector(".cell-pid td");
	const $modalPm2ID = $wikiModal.querySelector(".cell-pm2-id td");
	const $modalMemoryUsed = $wikiModal.querySelector(".cell-memory-used td");
	const $modalMemoryPercent = $wikiModal.querySelector(".cell-memory-percent td");

	const status = await apiFetch(`pm2-status/${wikiPath}`);

	$wikiRow.setAttribute("data-status", status.status);
	$wikiRow.setAttribute("data-memory-used", status.memoryUsed);
	$wikiRow.setAttribute("data-memory-used-percent", status.memoryUsedPercent);

	showButton($wikiModal.q(".modal-action-stop"));
	showButton($wikiModal.q(".modal-action-start"));
	showButton($wikiModal.q(".modal-action-delete"));

	if (status) {
		$wikiRow.setAttribute("data-status", status.status);

		$statusCell.innerText = status.status;
		$memoryCell.querySelector(".primary").innerText = formatSize(status.memoryUsed);
		$memoryCell.querySelector(".secondary").innerText = `${status.memoryUsedPercent}%`;
		$modalPID.innerText = status.pid;
		$modalPm2ID.innerText = status.pmId;
		$modalMemoryUsed.innerText = formatSize(status.memoryUsed);
		$modalMemoryPercent.innerText = `${status.memoryUsedPercent}%`;

		if (status.status === "online") {
			hideButton($wikiModal.q(".modal-action-start"));
			hideButton($wikiModal.q(".modal-action-delete"));
		}

	} else {
		$wikiRow.setAttribute("data-status", "offline");

		$statusCell.innerText = "offline";
		$memoryCell.querySelector(".primary").innerHTML = '<span class="muted">n/a</span>';
		$memoryCell.querySelector(".secondary").innerHTML = '<span class="muted">n/a</span>';
		$modalPID.innerHTML = '<span class="muted">n/a</span>';
		$modalPm2ID.innerHTML = '<span class="muted">n/a</span>';
		$modalMemoryUsed.innerHTML = '<span class="muted">n/a</span>';
		$modalMemoryPercent.innerHTML = '<span class="muted">n/a</span>';

		hideButton($wikiModal.q(".modal-action-stop"));
	}
}

export async function loadWikiDetails(wikiPath, $wikiRow, $wikiModal) {
	const details = await apiFetch(`wiki-details/${wikiPath}`);

	$wikiRow.setAttribute("data-port", details.port);
	$wikiRow.setAttribute("data-title", details.title);
	$wikiRow.setAttribute("data-tiddlers-count", details.tiddlersCount);
	$wikiRow.setAttribute("data-tiddlers-size", details.tiddlersSize);
	$wikiRow.setAttribute("data-total-size", details.totalSize);

	const $titleCell = $wikiRow.querySelector(".cell-title a");
	const $sizeCell = $wikiRow.querySelector(".cell-size");
	const $tiddlersCell = $wikiRow.querySelector(".cell-tiddlers");

	const $modalTitle = $wikiModal.querySelector("header");
	const $modalPort = $wikiModal.querySelector(".cell-port td");
	const $modalTiddlers = $wikiModal.querySelector(".cell-tiddlers td");
	const $modalSizeTiddlers = $wikiModal.querySelector(".cell-size-tiddlers td");
	const $modalSizeAll = $wikiModal.querySelector(".cell-size-all td");

	if (details) {
		$titleCell.innerText = details.title;
		$sizeCell.querySelector(".primary").innerText = formatSize(details.tiddlersSize);
		$sizeCell.querySelector(".secondary").innerText = formatSize(details.totalSize);
		$tiddlersCell.innerText = details.tiddlersCount;

		$modalTitle.innerText = details.title;
		$modalPort.innerText = details.port;
		$modalTiddlers.innerText = details.tiddlersCount;
		$modalSizeTiddlers.innerText = formatSize(details.tiddlersSize);
		$modalSizeAll.innerText = formatSize(details.totalSize);
	} else {
		$titleCell.innerText = "<failed to load>";
		$sizeCell.querySelector(".primary").innerText = "???B";
		$sizeCell.querySelector(".secondary").innerText = "???B";

		$modalTitle.innerText = "<failed to load>";
		$modalPort.innerText = "????";
		$tiddlersCell.innerText = "??";
		$modalTiddlers.innerText = "??";
		$modalSizeTiddlers.innerText = "???B";
		$modalSizeAll.innerText = "???B";
	}
}

export async function loadBackups(wikiPath, $wikiRow, $wikiModal) {
	const backups = await apiFetch(`wiki-backups/${wikiPath}`) ?? [];

	const $backups = $wikiModal.querySelector(".modal-backups");
	removeElements($backups.querySelector(".spinner"));
	removeElements($backups.querySelectorAll(".modal-backup-row"));

	backups.sort((l, r) => r.localeCompare(l));

	if (backups.length === 0) {
		$backups.appendChild(dm("div", {
			class: "modal-backup-row muted",
			text: "No backups found..."
		}));
	}

	for (const backupFileName of backups) {
		const timestamp = parseInt(backupFileName.split(".")[0]);

		const $backupRow = createBackupRowHtml(wikiPath, backupFileName, timestamp);

		$backups.appendChild($backupRow);

		$backupRow.querySelector(".action-delete-backup").addEventListener("click", () => {
			if (confirm(`Are you sure you want to delete backup from ${formatDate("YYYY-MM-DD hh:mm:ss", timestamp)}?`)) {
				deleteBackup(wikiPath, backupFileName, $wikiModal, $backupRow);
			}
		});

		$backupRow.querySelector(".action-restore-backup").addEventListener("click", () => {
			if (confirm(`Are you sure you want to restore backup from ${formatDate("YYYY-MM-DD hh:mm:ss", timestamp)}? All current TW content will be removed, consider backing it up first.`)) {
				restoreBackup(wikiPath, backupFileName, $wikiRow, $wikiModal, $backupRow);
			}
		});
	}
}

export async function backupWiki(wikiPath, $wikiRow, $wikiModal) {
	if (!confirm(`Are you sure you want to backup wiki ${wikiPath}?`)) {
		return;
	}

	const $button = $wikiModal.querySelector(".modal-action-backup");
	addSpinner($button);

	setDisabled($wikiModal, [$button, "button"], true);

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`backup-wiki/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadBackups(wikiPath, $wikiRow, $wikiModal);
	}

	removeSpinner($button);
	setDisabled($wikiModal, [$button, "button"], false);
}

export async function stopWiki(wikiPath, $wikiRow, $wikiModal) {
	setDisabled($wikiModal, ["button"], true);

	const $button = $wikiModal.querySelector(".modal-action-stop");
	addSpinner($button);

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`stop-wiki/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadPm2Status(wikiPath, $wikiRow, $wikiModal);
	}

	removeSpinner($button);
	setDisabled($wikiModal, ["button"], false);
}

export async function startWiki(wikiPath, $wikiRow, $wikiModal) {
	setDisabled($wikiModal, ["button"], true);

	const $button = $wikiModal.querySelector(".modal-action-start");
	addSpinner($button);

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`start-wiki/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadPm2Status(wikiPath, $wikiRow, $wikiModal);
	}

	removeSpinner($button);
	setDisabled($wikiModal, ["button"], false);
}

export async function deleteBackup(wikiPath, backup, $wikModal, $backupRow) {
	const $button = $backupRow.querySelector(".action-delete-backup");
	addSpinner($button);

	setDisabled($wikModal, ["button"], true);

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`delete-wiki-backup/${wikiPath}/${backup}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());
		removeSpinner($button);

	} else {
		$backupRow.remove();
	}

	setDisabled($wikModal, ["button"], false);
}

export async function restoreBackup(wikiPath, backup, $wikiRow, $wikiModal, $backupRow) {
	const $button = $backupRow.querySelector(".action-delete-backup");
	addSpinner($button);

	setDisabled($wikiModal, ["button"], true);

	const csrf = await apiFetch("csrf-token");
	const jobId = await apiFetchPost(`wiki/restore-backup/${wikiPath}/${backup}`, { csrf });

	if (getLastApiError()) {
		alert(`Operation failed: ${getLastApiError()}`);
		return false;
	}

	$wikiModal.classList.remove("visible");

	await trackJob(jobId, `Restoring backup '${backup}' to /${wikiPath}`);

	$wikiModal.classList.add("visible");
	document.q("#modals").classList.add("visible");

	await Promise.all([
		await loadPm2Status(wikiPath, $wikiRow, $wikiModal),
		await loadWikiDetails(wikiPath, $wikiRow, $wikiModal),
	]);

	removeSpinner($button);
	setDisabled($wikiModal, ["button"], false);

}