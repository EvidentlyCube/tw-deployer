import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { dm } from "./frontend.dm.js";
import { createBackupRowHtml } from "./frontend.getModalHtml.js";
import { formatDate, formatSize, removeElements, setDisabled } from "./frontend.utils.js";

export async function loadPm2Status(wikiPath, $tr, $modal) {
	const $statusCell = $tr.querySelector(".cell-status");
	const $memoryCell = $tr.querySelector(".cell-memory");

	const $modalPID = $modal.querySelector(".cell-pid td");
	const $modalPm2ID = $modal.querySelector(".cell-pm2-id td");
	const $modalMemoryUsed = $modal.querySelector(".cell-memory-used td");
	const $modalMemoryPercent = $modal.querySelector(".cell-memory-percent td");

	const status = await apiFetch(`pm2-status/${wikiPath}`);

	$tr.setAttribute("data-status", status.status);
	$tr.setAttribute("data-memory-used", status.memoryUsed);
	$tr.setAttribute("data-memory-used-percent", status.memoryUsedPercent);

	$modal.querySelector(".modal-action-stop").classList.remove("hide");
	$modal.querySelector(".modal-action-start").classList.remove("hide");
	$modal.querySelector(".modal-action-delete").classList.remove("hide");

	if (status) {
		$tr.setAttribute("data-status", status.status);

		$statusCell.innerText = status.status;
		$memoryCell.querySelector(".primary").innerText = formatSize(status.memoryUsed);
		$memoryCell.querySelector(".secondary").innerText = `${status.memoryUsedPercent}%`;
		$modalPID.innerText = status.pid;
		$modalPm2ID.innerText = status.pmId;
		$modalMemoryUsed.innerText = formatSize(status.memoryUsed);
		$modalMemoryPercent.innerText = `${status.memoryUsedPercent}%`;

		if (status.status === "online") {
			$modal.querySelector(".modal-action-start").classList.add("hide");
			$modal.querySelector(".modal-action-delete").classList.add("hide");
		}

	} else {
		$tr.setAttribute("data-status", "offline");

		$statusCell.innerText = "offline";
		$memoryCell.querySelector(".primary").innerHTML = '<span class="muted">n/a</span>';
		$memoryCell.querySelector(".secondary").innerHTML = '<span class="muted">n/a</span>';
		$modalPID.innerHTML = '<span class="muted">n/a</span>';
		$modalPm2ID.innerHTML = '<span class="muted">n/a</span>';
		$modalMemoryUsed.innerHTML = '<span class="muted">n/a</span>';
		$modalMemoryPercent.innerHTML = '<span class="muted">n/a</span>';

		$modal.querySelector(".modal-action-stop").classList.add("hide");
	}
}

export async function loadWikiDetails(wikiPath, $tr, $modal) {
	const details = await apiFetch(`wiki-details/${wikiPath}`);

	$tr.setAttribute("data-port", details.port);
	$tr.setAttribute("data-title", details.title);
	$tr.setAttribute("data-tiddlers-count", details.tiddlersCount);
	$tr.setAttribute("data-tiddlers-size", details.tiddlersSize);
	$tr.setAttribute("data-total-size", details.totalSize);

	const $titleCell = $tr.querySelector(".cell-title a");
	const $sizeCell = $tr.querySelector(".cell-size");
	const $tiddlersCell = $tr.querySelector(".cell-tiddlers");

	const $modalTitle = $modal.querySelector("header");
	const $modalPort = $modal.querySelector(".cell-port td");
	const $modalTiddlers = $modal.querySelector(".cell-tiddlers td");
	const $modalSizeTiddlers = $modal.querySelector(".cell-size-tiddlers td");
	const $modalSizeAll = $modal.querySelector(".cell-size-all td");

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

export async function loadBackups(wikiPath, $modal) {
	const backups = await apiFetch(`wiki-backups/${wikiPath}`) ?? [];

	const $backups = $modal.querySelector(".modal-backups");
	removeElements($backups.querySelector(".spinner"));
	removeElements($backups.querySelectorAll(".modal-backup-row"));

	backups.sort((l, r) => r.localeCompare(l));

	for (const backupFileName of backups) {
		const timestamp = parseInt(backupFileName.split(".")[0]);

		const $backup = createBackupRowHtml(wikiPath, backupFileName, timestamp);

		$backups.appendChild($backup);

		$backup.querySelector(".action-delete-backup").addEventListener("click", () => {
			if (confirm(`Are you sure you want to delete backup from ${formatDate("YYYY-MM-DD hh:mm:ss", timestamp)}?`)) {
				deleteBackup(wikiPath, backupFileName, $modal, $backup);
			}
		});

		$backup.querySelector(".action-restore-backup").addEventListener("click", () => {
			if (confirm(`Are you sure you want to restore backup from ${formatDate("YYYY-MM-DD hh:mm:ss", timestamp)}? All current TW content will be removed, consider backing it up first.`)) {

			}
		});
	}
}

export async function backupWiki(wikiPath, $modal) {
	if (!confirm(`Are you sure you want to backup wiki ${wikiPath}?`)) {
		return;
	}

	const $button = $modal.querySelector(".modal-action-backup");
	const oldText = $button.innerText;
	$button.innerText = "Backing up ";
	$button.appendChild(dm("~spinner50"));

	setDisabled($modal, [$button, "button"], true);

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`backup-wiki/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadBackups(wikiPath, $modal);
	}

	$button.innerText = oldText;
	setDisabled($modal, [$button, "button"], false);
}

export async function stopWiki(wikiPath, $tr, $modal) {
	setDisabled($modal, ["button"], true);

	const $button = $modal.querySelector(".modal-action-stop");
	const oldText = $button.innerText;
	$button.innerText = "Stopping ";
	$button.appendChild(dm("~spinner50"));

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`stop-wiki/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadPm2Status(wikiPath, $tr, $modal);
	}

	$button.innerText = oldText;
	setDisabled($modal, ["button"], false);
}

export async function startWiki(wikiPath, $tr, $modal) {
	setDisabled($modal, ["button"], true);

	const $button = $modal.querySelector(".modal-action-start");
	const oldText = $button.innerText;
	$button.innerText = "Starting ";
	$button.appendChild(dm("~spinner50"));

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`start-wiki/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(getLastApiError());

	} else {
		await loadPm2Status(wikiPath, $tr, $modal);
	}

	$button.innerText = oldText;
	setDisabled($modal, ["button"], false);
}

export async function deleteBackup(wikiPath, backup, $modal, $backup) {
	const $button = $backup.querySelector(".action-delete-backup");
	const oldText = $button.innerText;
	$button.innerText = "Deleting ";
	$button.appendChild(dm("~spinner50"));

	setDisabled($modal, ["button"], true);

	const csrf = await apiFetch("csrf-token");
	await apiFetchPost(`delete-wiki-backup/${wikiPath}/${backup}`, { csrf });

	if (getLastApiError()) {
		$button.innerText = oldText;
		alert(getLastApiError());

	} else {
		$backup.remove();
	}

	setDisabled($modal, ["button"], false);
}