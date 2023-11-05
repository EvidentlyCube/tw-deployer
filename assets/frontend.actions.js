import { apiFetch } from "./frontend.api.js";
import { formatSize } from "./frontend.utils.js";

export async function loadPm2Status(wikiPath, $tr) {
	const $statusCell = $tr.querySelector(".cell-status");
	const $memoryCell = $tr.querySelector(".cell-memory");
	const status = await apiFetch(`pm2-status/${wikiPath}`, false);

	$tr.setAttribute("data-status", status.status);
	$tr.setAttribute("data-memory-used", status.memoryUsed);
	$tr.setAttribute("data-memory-used-percent", status.memoryUsedPercent);

	if (status) {
		$statusCell.innerText = status.status;
		$memoryCell.querySelector(".primary").innerText = formatSize(status.memoryUsed);
		$memoryCell.querySelector(".muted").innerText = `${status.memoryUsedPercent}%`;
		$tr.setAttribute("data-status", status.status);
	} else {
		$statusCell.innerText = "Unknown";
		$memoryCell.querySelector(".primary").innerText = "???B";
		$memoryCell.querySelector(".muted").innerText = "??%";
		$tr.setAttribute("data-status", status.unknown);
	}
}

export async function loadWikiDetails(wikiPath, $tr) {
	const details = await apiFetch(`wiki-details/${wikiPath}`, false);

	$tr.setAttribute("data-port", details.port);
	$tr.setAttribute("data-title", details.title);
	$tr.setAttribute("data-tiddlers-count", details.tiddlersCount);
	$tr.setAttribute("data-tiddlers-size", details.tiddlersSize);
	$tr.setAttribute("data-total-size", details.totalSize);

	const $titleCell = $tr.querySelector(".cell-title a");
	const $sizeCell = $tr.querySelector(".cell-size");
	const $tiddlersCell = $tr.querySelector(".cell-tiddlers");

	if (details) {
		$titleCell.innerText = details.title;
		$sizeCell.querySelector(".primary").innerText = formatSize(details.tiddlersSize);
		$sizeCell.querySelector(".muted").innerText = formatSize(details.totalSize);
		$tiddlersCell.innerText = details.tiddlersCount;
	} else {
		$titleCell.innerText = "<failed to load>";
		$sizeCell.querySelector(".primary").innerText = "???B";
		$sizeCell.querySelector(".muted").innerText = "???B";
		$tiddlersCell.innerText = "??";
	}
}