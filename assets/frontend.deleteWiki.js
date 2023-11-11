import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { trackJob } from "./frontend.jobs.js";

export async function deleteWiki(wikiPath, $tr, $modal) {
	const csrf = await apiFetch("csrf-token");
	const jobId = await apiFetchPost(`wiki-delete/${wikiPath}`, { csrf });

	if (getLastApiError()) {
		alert(`Operation failed: ${getLastApiError()}`);
		return;
	}

	await trackJob(jobId, `Deleting wiki /${wikiPath}`);

	$modal.remove();
	$tr.remove();
}
