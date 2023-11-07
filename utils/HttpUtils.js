import Config from "../config.js";
import { ApiError } from "./Errors.js";

export async function parseRequestBody(request) {
	if (request.method !== "POST") {
		return null;
	}

	return new Promise(resolve => {
		const chunks = [];
		let chunksSize = 0;

		request.on("data", function (chunk) {
			chunks.push(chunk);
			chunksSize += chunk.length;

			if (chunksSize > Config.PostLimit) {
				request.connection.destroy();
				throw new Error("Error");
			}
		});

		request.on("end", function () {
			resolve(Buffer.concat(chunks));
		});
	});
}

export async function parseRequestBodyJson(request, defaultObject) {
	const body = await parseRequestBody(request);

	try {
		const parsedBody = JSON.parse(body);

		if (typeof parsedBody !== "object") {
			throw new ApiError(400, "Provided payload is not a valid JSON - not an object");
		}

		request.body = defaultObject;
		for (const fieldName of Object.keys(defaultObject)) {
			if (typeof parsedBody[fieldName] !== "undefined") {
				request.body[fieldName] = parsedBody[fieldName];
			}
		}

	} catch (e) {
		throw new ApiError(400, `Provided payload is not a valid JSON - ${String(e)}`);
	}
}
