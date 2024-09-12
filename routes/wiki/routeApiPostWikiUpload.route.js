import { writeFile } from "node:fs/promises";
import { startJobUploadWiki } from "../../jobs/jobUploadWiki.js";
import { isSupportedArchive } from "../../utils/ArchiveUtils.js";
import { validateCsrfToken } from "../../utils/Csrf.js";
import { ApiError } from "../../utils/Errors.js";
import { createTempFilePath, fileExists, getFileExtension } from "../../utils/FileUtils.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../../utils/PathUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=wiki/upload",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", wikiPath: "", title: "", archive: "", archiveName: "" });

	const { title, wikiPath, archive, archiveName } = await validateParams(req);

	const archiveTempPathAbs = await createTempFilePath("archive", getFileExtension(archiveName));

	await writeFile(
		archiveTempPathAbs,
		Buffer.from(archive, "base64")
	);

	console.log(title, wikiPath, archiveName, archiveTempPathAbs);

	const jobId = await startJobUploadWiki(title, wikiPath, archiveTempPathAbs);
	respondApiSuccess(res, jobId);
}

async function validateParams(req) {
	const { csrf, wikiPath, title, archive, archiveName } = req.body;

	await validateCsrfToken(csrf);

	if (!title) {
		throw new ApiError(400, "Payload is missing `title`");
	} else if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (await fileExists(wikiAbsPath)) {
		throw new ApiError(400, "Wiki already exists");
	} else if (!archive) {
		throw new ApiError(400, "Missing archive");
	} else if (!archiveName) {
		throw new ApiError(400, "Missing archive name");
	} else if (!isSupportedArchive(archiveName)) {
		throw new ApiError(400, "Unsupported archive type");
	}

	return { title, wikiPath, archive, archiveName };
}