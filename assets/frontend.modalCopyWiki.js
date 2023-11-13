import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { trackJob } from "./frontend.jobs.js";
import { hideModals, setDisabled, showModal } from "./frontend.utils.js";

export async function handleCopyWikiModal(template, $oldModal) {
	const $editModal = document.querySelector("#new-wiki-modal");

	showModal($editModal);
	$editModal.querySelector("header").innerHTML = `Create a copy of <code>/${template}</code>`;
	$editModal.querySelectorAll("input").forEach(input => input.value = "");
	setDisabled($editModal, "button", false);

	const onSubmit = async e => {
		if (e.type === "keydown" && e.key !== "Enter") {
			return;
		}

		const wikiPath = $editModal.querySelector("input[name=path]").value;
		const title = $editModal.querySelector("input[name=name]").value;

		if (!wikiPath) {
			return alert("Wiki Path was not provided");

		} else if (/[^a-z0-9-]/.test(wikiPath)) {
			return alert("Wiki Path contains disallowed characters");

		} else if (wikiPath.length > 64) {
			return alert("Wiki Path cannot be longer than 64 characters");

		} else if (!title) {
			return alert("Title is missing");
		}

		const csrf = await apiFetch("csrf-token");
		const jobId = await apiFetchPost(`wiki/copy/${template}`, { csrf, wikiPath, title });

		if (getLastApiError()) {
			alert(`Operation failed: ${getLastApiError()}`);
			return false;
		}

		teardown();

		await trackJob(jobId, `Copying wiki /${template} to /${wikiPath}`);

		window.location.reload();
	};

	const onClose = () => {
		teardown();

		showModal($oldModal);
	};

	const teardown = () => {
		$editModal.removeEventListener("keydown", onSubmit);
		$editModal.querySelector(".action-create").removeEventListener("click", onSubmit);
		$editModal.querySelector(".action-close").removeEventListener("click", onClose);

		hideModals();
	};

	$editModal.addEventListener("keydown", onSubmit);
	$editModal.querySelector(".action-create").addEventListener("click", onSubmit);
	$editModal.querySelector(".action-close").addEventListener("click", onClose);

}