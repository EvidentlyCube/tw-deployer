import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { trackJob } from "./frontend.jobs.js";

export async function createWiki(template, wikiPath, title, $modal) {
	const csrf = await apiFetch("csrf/generate");
	const jobId = await apiFetchPost(`wiki/copy/${template}`, { csrf, wikiPath, title });

	if (getLastApiError()) {
		alert(`Operation failed: ${getLastApiError()}`);
		return false;
	}


	await trackJob(jobId, `Copying wiki /${template} to /${wikiPath}`);

	window.location.reload();
}
