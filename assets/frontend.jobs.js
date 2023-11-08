import { apiFetch } from "./frontend.api.js";
import { dm } from "./frontend.dm.js";
import { formatDate, sleep } from "./frontend.utils.js";

const MaxDuration = 30 * 1000;

export async function trackJob(jobId, title) {
	const $modals = document.querySelector("#modals");
	const $jobModal = document.querySelector("#job-modal");
	const $logContainerModal = $jobModal.querySelector(".log-container");
	const $closeButton = $jobModal.querySelector(".action-close");

	$jobModal.querySelector("header").innerText = title;

	$closeButton.disabled = true;

	$modals.classList.add("visible");
	$jobModal.classList.add("visible");

	let lastLogs = 0;
	let lastNewLog = Date.now();
	let callsWithoutLogs = 0;
	let indent = 1;

	while (lastNewLog + MaxDuration) {
		const result = await apiFetch(`job/${jobId}`);

		if (result.logs.length > lastLogs) {
			for (const log of result.logs.slice(lastLogs)) {
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

	return new Promise(resolve => {
		const onClose = () => {
			$closeButton.removeEventListener("click", onClose);
			$jobModal.classList.remove("visible");
			$modals.classList.remove("visible");

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