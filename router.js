import { ActionError, ApiError, CsrfError, NotFoundError } from "./utils/Errors.js";
import { AccessLog } from "./utils/Logger.js";

export async function routeRequest(routesData, req, res) {
	for (const { route, rawRoute, action } of routesData) {
		const match = route.exec(req.url);

		if (match) {
			req.pathParams = { ...match.groups };

			AccessLog("router", `Routed to ${rawRoute}`);
			await action(req, res);
			return true;
		}
	}

	return false;
}

export async function routeErrorHandler(error, req, res) {
	if (error instanceof ApiError) {
		apiErrorResponse(res, error.statusCode, error.message);

	} else if (error instanceof CsrfError) {
		apiErrorResponse(res, 419, error.message);

	} else if (error instanceof NotFoundError) {
		apiErrorResponse(res, 404, "Endpoint not found");

	} else if (error instanceof ActionError) {
		apiErrorResponse(res, 500, error.message);

	} else {
		console.log(error.stack);
		const body = errorToString(error);

		res.writeHead(500, {
			"Content-Length": body.length,
			"Content-Type": "text/plain",
		});
		res.write(body);
		res.end();
	}
}

function apiErrorResponse(res, statusCode, message) {
	const jsonBody = JSON.stringify({
		error: message,
		body: null
	});
	res.writeHead(statusCode, {
		"Content-Length": jsonBody.length,
		"Content-Type": "text/plain",
	});
	res.write(jsonBody);
	res.end();
}

function errorToString(error) {
	if (typeof error === "string") {
		return error;
	} else if (typeof error === "object") {
		if (error.message) {
			return error.message;
		} else if (String(error).length > 0) {
			return String(error);
		} else {
			console.log(error);
			return JSON.stringify(error);
		}
	} else {
		console.log(error);
		console.log(typeof error);
		return "Unknown error...";
	}
}
