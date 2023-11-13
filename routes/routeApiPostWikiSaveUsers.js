import * as fs from "node:fs";
import { startJobCopyWiki } from "../jobs/jobCopyWiki.js";
import { validateCsrfToken } from "../utils/Csrf.js";
import { ApiError } from "../utils/Errors.js";
import { canAccessFile, fileExists, isDirectory } from "../utils/FileUtils.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { assertPost, getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";
import { doNull, isSafeCsvValue } from "../utils/MiscUtils.js";
import { getWikiUsers } from "../utils/TwUtils.js";
import Config from "../config.js";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { actionPm2Restart } from "../actions/actionPm2Restart.js";

export default getRouteData(
	"/?api=wiki/save-users/:wikiPath",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", users: "" });

	const { wikiPath, users } = await validateParams(req);

	const userPasswordMap = await getUserPasswordMap(wikiPath);

	const userRows = resolveUserEntries(users, userPasswordMap);

	const usersCsvPath = resolve(
		getWikiAbsolutePath(wikiPath),
		"wiki",
		"users.csv"
	);

	await writeFile(
		usersCsvPath,
		"username,password\n"
		+ userRows.join("\n")
		+ "\n",
		"utf-8"
	);

	await actionPm2Restart(wikiPath, doNull);

	respondApiSuccess(res, true);
}

function resolveUserEntries(submittedUsers, existingUserPasswordMap) {
	const results = new Map();

	results.set(Config.Username, Config.Password);
	for (const user of submittedUsers) {
		const {username, password, keepPassword} = user;

		if (username === Config.Username) {
			continue;

		} else if (keepPassword) {
			if (!existingUserPasswordMap.has(username)) {
				throw new ApiError(400, `Requested to keep user ${username} but that user did not exist in the first place`);
			}

			results.set(username, existingUserPasswordMap.get(username));

		} else {
			results.set(username, password);
		}
	}

	return Array.from(results.entries()).map(([username, password]) => `${username},${password}`);
}

async function getUserPasswordMap(wikiPath) {
	const users = await getWikiUsers(wikiPath);
	const map = new Map();

	for (const user of users)  {
		map.set(user.username, user.password);
	}

	return map;
}

async function validateParams(req) {
	const { csrf, users } = req.body;
	const { wikiPath } = req.pathParams;

	await validateCsrfToken(csrf);

	if (!Array.isArray(users)) {
		throw new ApiError(400, "Payload is has invalid key `users`");
	}

	users.forEach((user, index) => {
		if (typeof user !== "object") {
			throw new ApiError(400, `User at index ${index} is not an object`);
		} else if (!user.username) {
			throw new ApiError(400, `User at index ${index} has no username`);
		} else if (user.keepPassword !== true && user.keepPassword !== false) {
			throw new ApiError(400, `User '${user.username}' at index ${index} is missing or has invalid keepPassword key, it must be a boolean`);
		} else if (!user.password && !user.keepPassword) {
			throw new ApiError(400, `User '${user.username}' at index ${index} has no password even though they have "keepPassword" property set to false`);
		} else if (!isSafeCsvValue(user.username)) {
			throw new ApiError(400, `User '${user.username}' has unsupported characters in their username (Please avoid quotes, whitespace other than space and extended ascii characters)`);
		} else if (!isSafeCsvValue(user.password)) {
			throw new ApiError(400, `User '${user.username}' has unsupported characters in their password (Please avoid quotes, whitespace other than space and extended ascii characters)`);
		}
	});

	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (!await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki does not exist");
	}

	return { wikiPath, users };
}