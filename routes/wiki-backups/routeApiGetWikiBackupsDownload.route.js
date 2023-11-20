import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileExists } from "../../utils/FileUtils.js";
import { getWikiBackupsAbsolutePath, isSafePath, isValidWikiPath } from "../../utils/PathUtils.js";
import { getRouteData } from "../../utils/RouteUtils.js";
import { respondApiError } from "../respond.js";

export default getRouteData(
	"/?api=wiki-backups/download/:wikiPath/:backup",
	action
);

async function action(req, res) {
	const { wikiPath, backup } = req.pathParams;

	if (!isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	} else if (!isSafePath(backup)) {
		return respondApiError(res, 400, "Invalid backup name given");
	}

	const backupsDirAbs = getWikiBackupsAbsolutePath(wikiPath);
	const backupPathAbs = resolve(backupsDirAbs, backup);

	if (!await fileExists(backupPathAbs)) {
		return respondApiError(res, 400, "Backup does not exist");
	}

	const fileStat = await stat(backupPathAbs);

	res.writeHead(200, {
		"Content-Disposition": `attachment; filename="${backup}"`,
		"Content-Type": "application/gzip",
		"Content-Length": fileStat.size,
		"Cache-Control": "no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: 0
	});

	var readStream = createReadStream(backupPathAbs);
	readStream.pipe(res);
}