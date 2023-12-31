import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { trackJob } from "./frontend.jobs.js";
import { getFileAseBase64, hideModals, setDisabled, showModal } from "./frontend.utils.js";

export async function handleUploadWikiModal() {
	const $editModal = document.querySelector("#new-wiki-modal");

	showModal($editModal);
	$editModal.querySelector("header").innerHTML = "Create a new wiki";
	$editModal.querySelectorAll("input").forEach(input => input.value = "");
	$editModal.q(".zip-file").classList.remove("hide");
	setDisabled($editModal, "button", false);

	const onSubmit = async e => {
		if (e.type === "keydown" && e.key !== "Enter") {
			return;
		}

		const wikiPath = $editModal.querySelector("input[name=path]").value;
		const title = $editModal.querySelector("input[name=name]").value;
		const archiveFile = $editModal.querySelector("input[name=file]").files[0];

		if (!wikiPath) {
			return alert("Wiki Path was not provided");

		} else if (/[^a-z0-9-]/.test(wikiPath)) {
			return alert("Wiki Path contains disallowed characters");

		} else if (wikiPath.length > 64) {
			return alert("Wiki Path cannot be longer than 64 characters");

		} else if (!title) {
			return alert("Title is missing");

		} else if (!archiveFile) {
			return alert("No file uploaded");
		}

		const archiveName = archiveFile.name;

		if (
			!archiveName.endsWith(".zip")
			&& !archiveName.endsWith(".tar")
			&& !archiveName.endsWith(".tar.gz")
		) {
			return alert("Selected file must either be ZIP or TAR archive");
		}

		const archive = await getFileAseBase64(archiveFile);

		if (!archive) {
			return alert("Invalid file uploaded");
		}

		const csrf = await apiFetch("csrf/generate");
		console.log(JSON.stringify({ csrf, wikiPath, title, archive }).length / 1024 / 1024);
		const jobId = await apiFetchPost("wiki/upload", { csrf, wikiPath, title, archive, archiveName });

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
		$editModal.querySelector(".action-create").removeEventListener("click", onSubmit);
		$editModal.querySelector(".action-close").removeEventListener("click", onClose);

		hideModals();
	};

	$editModal.addEventListener("keydown", onSubmit);
	$editModal.querySelector(".action-create").addEventListener("click", onSubmit);
	$editModal.querySelector(".action-close").addEventListener("click", onClose);

}