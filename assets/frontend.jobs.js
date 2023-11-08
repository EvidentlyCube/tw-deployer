import { apiFetch } from "./frontend.api.js";
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

	while (lastNewLog + MaxDuration) {
		const result = await apiFetch(`job/${jobId}`);

		if (result.logs.length > lastLogs) {
			for (const log of result.logs.slice(lastLogs)) {
				$logContainerModal.appendChild(document.createTextNode(`[${formatDate("hh:mm:ss.lll", log.on)}] ${log.log}`));
				$logContainerModal.appendChild(document.createElement("br"));
			}

			lastLogs = result.logs.length;
			$logContainerModal.scrollTop = $logContainerModal.scrollHeight;
			callsWithoutLogs = 0;

		} else {
			callsWithoutLogs++;
		}

		if (result.isFinished) {
			$logContainerModal.appendChild(document.createElement("br"));
			$logContainerModal.appendChild(document.createElement("br"));
			$logContainerModal.appendChild(document.createTextNode(`Job Finished at ${formatDate("hh:mm:ss.lll", result.finishedTimestamp)}`));
			break;
		}

		await sleep(100 + 300 * callsWithoutLogs);
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