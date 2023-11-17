import { apiFetch } from "./frontend.api.js";
import { dm } from "./frontend.dm.js";
import { formatDate, hideModals, showModal, sleep } from "./frontend.utils.js";

const MaxDuration = 30 * 1000;

export async function trackJob(jobId, title, options = {}) {
	const $jobModal = document.querySelector("#job-modal");
	const $logContainerModal = $jobModal.querySelector(".log-container");
	const $closeButton = $jobModal.querySelector(".action-close");

	$logContainerModal.innerHTML = "";
	$jobModal.querySelector("header").innerText = title;

	$closeButton.disabled = true;

	showModal($jobModal);

	let lastLogs = 0;
	let lastNewLog = Date.now();
	let callsWithoutLogs = 0;
	let indent = 1;

	while (lastNewLog + MaxDuration) {
		const result = await apiFetch(`job/${jobId}`);

		if (!result) {
			$logContainerModal.appendChild(document.createElement("hr"));
			$logContainerModal.appendChild(dm("header", { class: "error", text: "Server responded with an error" }));
			break;
		}

		if (result.logs.length > lastLogs) {
			for (let log of result.logs.slice(lastLogs)) {
				if (typeof log === "string") {
					log = extractLogRowFromString(log);
				}

				if (log.log.toLowerCase().startsWith("[/action")) {
					indent--;
				}

				$logContainerModal.appendChild(formatLog(log, indent));

				if (log.log.toLowerCase().startsWith("[action")) {
					indent++;
				}
			}

			lastLogs = result.logs.length;
			$logContainerModal.scrollTop = $logContainerModal.scrollHeight;
			callsWithoutLogs = 0;

		} else {
			callsWithoutLogs++;
		}

		if (result.isError) {
			$logContainerModal.appendChild(document.createElement("hr"));
			$logContainerModal.appendChild(dm("header", { class: "error", text: `Job Failed at ${formatDate("hh:mm:ss.lll", result.finishedTimestamp)}` }));
			$logContainerModal.appendChild(dm("p", result.error.message));
			$logContainerModal.appendChild(dm("pre", result.error.stack));
			break;

		} else if (result.isFinished) {
			$logContainerModal.appendChild(document.createElement("hr"));
			$logContainerModal.appendChild(dm("header", { class: "success", text: `Job Finished at ${formatDate("hh:mm:ss.lll", result.finishedTimestamp)}` }));
			break;
		}

		await sleep(100 + callsWithoutLogs * 300);
	}

	$logContainerModal.scrollTop = $logContainerModal.scrollHeight;
	$closeButton.disabled = false;

	if (!options.preventJobRefresh) {
		document.dispatchEvent(new Event("tw-deployer:refresh-jobs"));
	}

	return new Promise(resolve => {
		const onClose = () => {
			$closeButton.removeEventListener("click", onClose);
			hideModals();

			resolve();
		};

		$closeButton.addEventListener("click", onClose);
	});
}

function formatLog(log, indent) {
	const row = document.createElement("p");

	row.appendChild(dm("span", { class: "muted", text: formatDate("hh:mm:ss.lll", log.on) }));
	row.appendChild(dm("span", { html: "&nbsp;".repeat(indent * 4) }));

	const logHtml = log.log
		.replace(/^(\S+[=:])/, "<strong>$1</strong>")
		.replace(/`([^`]+)`/g, "<strong>$1</strong>");

	row.appendChild(dm("span", { html: logHtml }));

	return row;
}

function extractLogRowFromString(logString) {
	const matches = /^\s*\[(.+?)\]\s*(.+)$/.exec(logString);

	if (matches) {
		return {
			log: matches[2],
			on: readDate(matches[1])
		};
	} else {
		return {
			log: logString,
			on: Date.now()
		};
	}
}

function readDate(dateString) {
	const matches = /^(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)\.(\d+)$/.exec(dateString);

	if (!matches) {
		console.log(dateString);
		return Date.now();
	}
	const date = new Date();
	date.setFullYear(
		parseInt(matches[1]),
		parseInt(matches[2]) - 1,
		parseInt(matches[3]),
	);
	date.setHours(
		parseInt(matches[4]),
		parseInt(matches[5]),
		parseInt(matches[6]),
		parseInt(matches[7])
	);

	return date.getTime();
}