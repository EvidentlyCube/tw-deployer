import { apiFetch, apiFetchPost } from "./frontend.api.js";

export async function createWiki() {
	const $form = document.querySelector("#new-tw");
	const $elements = Array.from($form.elements);

	$elements.forEach(element => element.disabled = true);

	const template = $form.querySelector("#template").value;
	const wikiPath = $form.querySelector("#path").value;
	const title = $form.querySelector("#name").value;
	const csrf = await apiFetch("csrf-token");

	const response = await apiFetchPost(`copy-wiki/${template}/${wikiPath}`, { csrf, title });

	if (response.error) {
		$elements.forEach(element => element.disabled = false);

		alert(response.error);
	} else {
		console.log(response);
	}

}
