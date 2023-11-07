let lastApiError = null;

export async function apiFetch(endpoint, options) {
	lastApiError = null;

	const result = await fetch(`?api=${endpoint}`, options);
	const text = await result.text();

	try {
		const json = JSON.parse(text);
		if (json.error) {
			lastApiError = json.error;

			return false;
		}

		return json.body;
	} catch (e) {
		lastApiError = e.message;

		return false;
	}
}

export async function apiFetchPost(endpoint, body) {
	return apiFetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body)
	});
}

export function getLastApiError() {
	return lastApiError;
}