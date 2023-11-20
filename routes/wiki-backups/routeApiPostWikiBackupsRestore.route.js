import { startJobRestoreBackup } from "../../jobs/jobRestoreBackup.js";
import { validateCsrfToken } from "../../utils/Csrf.js";
import { ApiError } from "../../utils/Errors.js";
import { fileExists } from "../../utils/FileUtils.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { getWikiAbsolutePath, getWikiBackupsAbsolutePath, isSafePath, isValidWikiPath } from "../../utils/PathUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=wiki-backups/restore/:wikiPath/:backup",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "" });

	const { wikiPath, backup } = await validateParams(req);

	const jobId = await startJobRestoreBackup(wikiPath, backup);
	respondApiSuccess(res, jobId);
}

async function validateParams(req) {
	await validateCsrfToken(req.body.csrf);

	const { wikiPath, backup } = req.pathParams;
	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	} else if (!isSafePath(backup)) {
		throw Error("Invalid backup name");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);
	const backupAbsPath = getWikiBackupsAbsolutePath(wikiPath);

	if (!await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki does not exists");

	} else if (!await fileExists(backupAbsPath)) {
		throw new ApiError(400, "Backup does not exists");
	}

	return { wikiPath, backup };
}