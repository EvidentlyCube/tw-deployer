import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { trackJob } from "./frontend.jobs.js";
import { addSpinner, hideModals, removeSpinner, setButtonsDisabled, setDisabled, showModal } from "./frontend.utils.js";

export async function handleCreateWikiModal() {
	const $editModal = document.querySelector("#new-wiki-modal");
	const $createButton = $editModal.querySelector(".action-create");
	const $closeButton = $editModal.querySelector(".action-close");

	showModal($editModal);
	$editModal.q("header").innerHTML = "Create a new wiki";
	$editModal.qA("input").forEach(input => input.value = "");
	$editModal.q(".zip-file").classList.add("hide");
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

		addSpinner($createButton);
		setButtonsDisabled($editModal, true);

		const csrf = await apiFetch("csrf/generate");
		const jobId = await apiFetchPost("wiki/create", { csrf, wikiPath, title });

		removeSpinner($createButton);
		setButtonsDisabled($editModal, false);

		if (getLastApiError()) {
			alert(`Operation failed: ${getLastApiError()}`);
			return false;
		}

		teardown();

		await trackJob(jobId, `Creating wiki /${wikiPath}`);

		window.location.reload();
	};

	const onClose = () => {
		teardown();
	};

	const teardown = () => {
		$editModal.removeEventListener("keydown", onSubmit);
		$createButton.removeEventListener("click", onSubmit);
		$closeButton.removeEventListener("click", onClose);

		hideModals();
	};

	$editModal.addEventListener("keydown", onSubmit);
	$createButton.addEventListener("click", onSubmit);
	$closeButton.addEventListener("click", onClose);

}