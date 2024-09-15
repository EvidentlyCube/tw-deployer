import { randomBytes } from "node:crypto";
import Config from "../config.js";
import { CsrfError } from "./Errors.js";

const tokens = new Map();

export async function generateCsrfToken() {
	const token = randomBytes(16).toString("hex");

	tokens.set(token, Date.now());

	return token;
}

export async function validateCsrfToken(token) {
	const created = tokens.get(token);

	if (!created) {
		throw new CsrfError("Invalid token given.");
	}

	tokens.delete(token);

	if (isTokenExpired(created)) {
		throw new CsrfError("Token has expired.");
	}
}

function isTokenExpired(creationTime) {
	return creationTime + Config.CsrfTokenValidityMs < Date.now();
}

setTimeout(() => {
	for (const token of Array.from(tokens.keys())) {
		if (isTokenExpired(tokens.get(token))) {
			tokens.delete(token);
		}
	}
}, 60 * 60 * 1000);