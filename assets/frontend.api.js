
export async function apiFetch(endpoint, defReturn, options) {
	const result = await fetch(`?api=${endpoint}`, options);
	const text = await result.text();
	try {
		const json = JSON.parse(text);
		if (json.error) {
			if (defReturn !== undefined) {
				return defReturn;
			}
			alert(`Fatal error: ${json.error}`);
		}

		return json.body;
	} catch (e) {
		if (defReturn !== undefined) {
			return defReturn;
		}

		console.error("Received response: " + text);
		alert(e);
	}
}
