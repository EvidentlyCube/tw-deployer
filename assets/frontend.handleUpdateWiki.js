import { apiFetch, apiFetchPost } from "./frontend.api.js";
import { addSpinner, setButtonsDisabled, sleep } from "./frontend.utils.js";

export async function handleUpdateWiki() {
	addSpinner(document.q("#action-self-update"));
	setButtonsDisabled(document, false);

	const csrf = await apiFetch("csrf/generate");
	await apiFetchPost("system/self-update", { csrf });

	await sleep(5000);

	window.location.reload();
}