import { randomBytes } from "crypto";
import Config from "../config.js";
import { OneTimeCodeError } from "./Errors";

const codes = new Map();

export async function generateOneTimeCode(endpoint) {
	const code = randomBytes(32).toString("hex");

	code.set(code, {
		endpoint,
		createdAt: Date.now()
	});

	return code;
}

export async function validateOneTimeCode(code) {
	const codeData = codes.get(code);

	codes.delete(code);

	if (!codeData || isCodeExpired(codeData.createdAt)) {
		throw new OneTimeCodeError("Invalid one time code.");
	}

	return codeData.endpoint;
}

function isCodeExpired(creationTime) {
	return creationTime + Config.OneTimeCodeValidityMs < Date.now();
}

setTimeout(() => {
	const codes = Array.from(codes.keys());

	for (const code of codes) {
		if (isCodeExpired(codes.get(code.createdAt))) {
			codes.delete(code);
		}
	}
}, 60 * 60 * 1000);