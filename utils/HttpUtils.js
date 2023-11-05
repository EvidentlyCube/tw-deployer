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

export async function parseRequestBodyJson(request) {
	const body = await parseRequestBody(request);

	try {
		const result = JSON.parse(body);

		if (typeof result !== "object") {
			throw new ApiError(400, "Provided payload is not a valid JSON - not an object");
		}

		return result;
	} catch (e) {
		throw new ApiError(400, `Provided payload is not a valid JSON - ${String(e)}`);
	}
}
