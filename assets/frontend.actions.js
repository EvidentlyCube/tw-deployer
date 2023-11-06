import { apiFetch } from "./frontend.api.js";
import { formatSize } from "./frontend.utils.js";

export async function loadPm2Status(wikiPath, $tr, $modal) {
	const $statusCell = $tr.querySelector(".cell-status");
	const $memoryCell = $tr.querySelector(".cell-memory");

	const $modalPID = $modal.querySelector('.cell-pid td')
	const $modalPm2ID = $modal.querySelector('.cell-pm2-id td')
	const $modalMemoryUsed = $modal.querySelector('.cell-memory-used td')
	const $modalMemoryPercent = $modal.querySelector('.cell-memory-percent td')

	const status = await apiFetch(`pm2-status/${wikiPath}`, false);

	$tr.setAttribute("data-status", status.status);
	$tr.setAttribute("data-memory-used", status.memoryUsed);
	$tr.setAttribute("data-memory-used-percent", status.memoryUsedPercent);

	if (status) {
		$tr.setAttribute("data-status", status.status);

		$statusCell.innerText = status.status;
		$memoryCell.querySelector(".primary").innerText = formatSize(status.memoryUsed);
		$memoryCell.querySelector(".muted").innerText = `${status.memoryUsedPercent}%`;
		$modalPID.innerText = status.pid;
		$modalPm2ID.innerText = status.pmId
		$modalMemoryUsed.innerText = formatSize(status.memoryUsed);
		$modalMemoryPercent.innerText = `${status.memoryUsedPercent}%`;
	} else {
		$tr.setAttribute("data-status", "unknown");

		$statusCell.innerText = "Unknown";
		$memoryCell.querySelector(".primary").innerText = "???B";
		$memoryCell.querySelector(".muted").innerText = "??%";
		$modalPID.innerText = '??';
		$modalPm2ID.innerText = '??';
		$modalMemoryUsed.innerText = '???B';
		$modalMemoryPercent.innerText = '??%';
	}
}

export async function loadWikiDetails(wikiPath, $tr, $modal) {
	const details = await apiFetch(`wiki-details/${wikiPath}`, false);

	$tr.setAttribute("data-port", details.port);
	$tr.setAttribute("data-title", details.title);
	$tr.setAttribute("data-tiddlers-count", details.tiddlersCount);
	$tr.setAttribute("data-tiddlers-size", details.tiddlersSize);
	$tr.setAttribute("data-total-size", details.totalSize);

	const $titleCell = $tr.querySelector(".cell-title a");
	const $sizeCell = $tr.querySelector(".cell-size");
	const $tiddlersCell = $tr.querySelector(".cell-tiddlers");

	const $modalTitle = $modal.querySelector('header')
	const $modalPort = $modal.querySelector('.cell-port td')
	const $modalTiddlers = $modal.querySelector('.cell-tiddlers td')
	const $modalSizeTiddlers = $modal.querySelector('.cell-size-tiddlers td')
	const $modalSizeAll = $modal.querySelector('.cell-size-all td')

	if (details) {
		$titleCell.innerText = details.title;
		$sizeCell.querySelector(".primary").innerText = formatSize(details.tiddlersSize);
		$sizeCell.querySelector(".muted").innerText = formatSize(details.totalSize);
		$tiddlersCell.innerText = details.tiddlersCount;

		$modalTitle.innerText = details.title;
		$modalPort.innerText = details.port;
		$modalTiddlers.innerText = details.tiddlersCount;
		$modalSizeTiddlers.innerText = formatSize(details.tiddlersSize);
		$modalSizeAll.innerText = formatSize(details.totalSize);
	} else {
		$titleCell.innerText = "<failed to load>";
		$sizeCell.querySelector(".primary").innerText = "???B";
		$sizeCell.querySelector(".muted").innerText = "???B";

		$modalTitle.innerText = "<failed to load>";
		$modalPort.innerText = "????";
		$tiddlersCell.innerText = "??";
		$modalTiddlers.innerText = "??";
		$modalSizeTiddlers.innerText = "???B";
		$modalSizeAll.innerText = "???B";
	}
}