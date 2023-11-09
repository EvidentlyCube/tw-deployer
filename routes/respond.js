export function respond(res, statusCode, body, contentType, additionalHeaders) {
	body = body ?? "";
	additionalHeaders = additionalHeaders ?? {};

	const headers = {
		"Content-Length": (new Blob([body])).size,
		"Cache-Control": "no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: 0,
		...additionalHeaders
	};

	if (body && contentType) {
		headers["Content-Type"] = contentType;
	}

	res.writeHead(statusCode, headers);
	if (body.length > 0) {
		res.write(body);
	}
	res.end();
}

export function respondError(res, statusCode, error) {
	respond(res, statusCode, error, "text/plain");
}

export function respondApiSuccess(res, body) {
	respond(res, 200, JSON.stringify({ error: null, body }), "application/json", {});
}

export function respondApiError(res, statusCode, error) {
	respond(res, statusCode, JSON.stringify({ error, body: null }), "application/json", {});
}