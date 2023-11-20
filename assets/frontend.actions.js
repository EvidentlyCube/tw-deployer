import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { dm } from "./frontend.dm.js";
import { createBackupRowHtml } from "./frontend.getModalHtml.js";
import { trackJob } from "./frontend.jobs.js";
import { addSpinner, formatDate, formatSize, hideButton, removeElements, removeSpinner, setButtonsDisabled, setDisabled, showButton, showModal } from "./frontend.utils.js";

export async function loadPm2Status(wikiPath, $wikiRow, $wikiModal) {
	const $statusCell = $wikiRow.querySelector(".cell-status");
	const $memoryCell = $wikiRow.querySelector(".cell-memory");

	const $modalPID = $wikiModal.querySelector(".cell-pid td");
	const $modalPm2ID = $wikiModal.querySelector(".cell-pm2-id td");
	const $modalMemoryUsed = $wikiModal.querySelector(".cell-memory-used td");
	const $modalMemoryPercent = $wikiModal.querySelector(".cell-memory-percent td");

	const [statusPm2, statusShared] = await Promise.all([
		apiFetch(`status/pm2-wiki/info/${wikiPath}`),
		apiFetch(`status/shared-wiki/info/${wikiPath}`)
	]);

	$wikiRow.setAttribute("data-status", statusPm2.status);
	$wikiRow.setAttribute("data-memory-used", statusPm2.memoryUsed);
	$wikiRow.setAttribute("data-memory-used-percent", statusPm2.memoryUsedPercent);

	showButton($wikiModal.q(".modal-action-stop"));
	showButton($wikiModal.q(".modal-action-start"));
	showButton($wikiModal.q(".modal-action-start-shared"));
	showButton($wikiModal.q(".modal-action-delete"));

	if (statusPm2) {
		$wikiRow.setAttribute("data-mode", "pm2");
		$wikiRow.setAttribute("data-status", statusPm2.status);

		$statusCell.innerText = statusPm2.status;
		$memoryCell.querySelector(".primary").innerText = formatSize(statusPm2.memoryUsed);
		$memoryCell.querySelector(".secondary").innerText = `${statusPm2.memoryUsedPercent}%`;
		$modalPID.innerText = statusPm2.pid;
		$modalPm2ID.innerText = statusPm2.pmId;
		$modalMemoryUsed.innerText = formatSize(statusPm2.memoryUsed);
		$modalMemoryPercent.innerText = `${statusPm2.memoryUsedPercent}%`;

		if (statusPm2.status === "online") {
			hideButton($wikiModal.q(".modal-action-start"));
			hideButton($wikiModal.q(".modal-action-start-shared"));
			hideButton($wikiModal.q(".modal-action-delete"));
		}

	} else if (statusShared) {
		$wikiRow.setAttribute("data-mode", "shared");
		$wikiRow.setAttribute("data-status", statusShared.status);

		$statusCell.innerText = statusShared.status;
		$memoryCell.querySelector(".primary").innerHTML = '<span class="muted">n/a</span>';
		$memoryCell.querySelector(".secondary").innerHTML = '<span class="muted">n/a</span>';
		$modalPID.innerHTML = '<span class="muted">n/a</span>';
		$modalPm2ID.innerHTML = '<span class="muted">n/a</span>';
		$modalMemoryUsed.innerHTML = '<span class="muted">n/a</span>';
		$modalMemoryPercent.innerHTML = '<span class="muted">n/a</span>';

		hideButton($wikiModal.q(".modal-action-start"));
		hideButton($wikiModal.q(".modal-action-start-shared"));
		hideButton($wikiModal.q(".modal-action-delete"));

	} else {
		$wikiRow.setAttribute("data-mode", "off");
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
	const details = await apiFetch(`wiki/info/${wikiPath}`);

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
	const backups = await apiFetch(`wiki-backups/summary/${wikiPath}`) ?? [];

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

	setButtonsDisabled($wikiModal, true);

	const csrf = await apiFetch("csrf/generate");
	await apiFetchPost(`wiki-backups/create/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadBackups(wikiPath, $wikiRow, $wikiModal);
	}

	removeSpinner($button);
	setButtonsDisabled($wikiModal, false);
}

export async function stopWiki(wikiPath, $wikiRow, $wikiModal) {
	setButtonsDisabled($wikiModal, true);

	const $button = $wikiModal.querySelector(".modal-action-stop");
	addSpinner($button);

	const csrf = await apiFetch("csrf/generate");
	if ($wikiRow.getAttribute("data-mode") === "pm2") {
		await apiFetchPost(`status/pm2-wiki/stop${wikiPath}`, { csrf });

	} else if ($wikiRow.getAttribute("data-mode") === "shared") {
		await apiFetchPost(`status/shared-wiki/unregister/${wikiPath}`, { csrf });
	}

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadPm2Status(wikiPath, $wikiRow, $wikiModal);
	}

	removeSpinner($button);
	setButtonsDisabled($wikiModal, false);
}

export async function startWiki(wikiPath, $wikiRow, $wikiModal) {
	setDisabled($wikiModal, ["button"], true);

	const $button = $wikiModal.querySelector(".modal-action-start");
	addSpinner($button);

	const csrf = await apiFetch("csrf/generate");
	await apiFetchPost(`status/pm2-wiki/start${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadPm2Status(wikiPath, $wikiRow, $wikiModal);
	}

	removeSpinner($button);
	setDisabled($wikiModal, ["button"], false);
}

export async function registerSharedWiki(wikiPath, $wikiRow, $wikiModal) {
	setDisabled($wikiModal, ["button"], true);

	const $button = $wikiModal.querySelector(".modal-action-start-shared");
	addSpinner($button);

	const csrf = await apiFetch("csrf/generate");
	await apiFetchPost(`status/shared-wiki/register/${wikiPath}`, { csrf });

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

	const csrf = await apiFetch("csrf/generate");
	await apiFetchPost(`wiki-backups/delete/${wikiPath}/${backup}`, { csrf });

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

	const csrf = await apiFetch("csrf/generate");
	const jobId = await apiFetchPost(`wiki-backups/restore/${wikiPath}/${backup}`, { csrf });

	if (getLastApiError()) {
		alert(`Operation failed: ${getLastApiError()}`);
		return false;
	}

	await trackJob(jobId, `Restoring backup '${backup}' to /${wikiPath}`);

	showModal($wikiModal);

	await Promise.all([
		await loadPm2Status(wikiPath, $wikiRow, $wikiModal),
		await loadWikiDetails(wikiPath, $wikiRow, $wikiModal),
	]);

	removeSpinner($button);
	setDisabled($wikiModal, ["button"], false);

}