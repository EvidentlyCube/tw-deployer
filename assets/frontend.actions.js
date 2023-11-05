import { apiFetch } from "./frontend.api.js";
import { formatTime } from "./frontend.utils.js";

export async function loadPm2Status(wikiPath, $tr) {
	const $pidCell = $tr.querySelector(".cell-pid");
	const $pm2IdCell = $tr.querySelector(".cell-pm2-id");
	const $statusCell = $tr.querySelector(".cell-status");
	const $uptimeCell = $tr.querySelector(".cell-uptime");

	const status = await apiFetch(`pm2-status/${wikiPath}`, false);

	if (status) {
		$pidCell.innerText = status.pid;
		$pm2IdCell.innerText = status.pmId;
		$uptimeCell.innerText = formatTime(status.uptime);
		$statusCell.innerText = status.pmId;
		$statusCell.className = `cell-status status-${status.status}`;
	} else {
		$pidCell.innerText = "???";
		$pm2IdCell.innerText = "???";
		$uptimeCell.innerText = "???";
		$statusCell.innerText = "???";
		$statusCell.className = "cell-status";
	}
}

export async function loadWikiDetails(wikiPath, $tr) {
	const details = await apiFetch(`wiki-details/${wikiPath}`, false);

	const $title = $tr.querySelector("h2");
	const $portCell = $tr.querySelector(".cell-port");

	if (details) {
		$title.innerText = details.title;
		$portCell.innerText = details.port;
	} else {
		$title.innerText = "<failed to load>";
		$portCell.innerText = "???";
	}

}