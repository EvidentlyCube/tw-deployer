import { createReadStream } from "node:fs";
import { stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { formatDate } from "../utils/DateUtils.js";
import { tarGzPath } from "../utils/ExecUtils.js";
import { fileExists } from "../utils/FileUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondError } from "./respond.js";

export default getRouteData(
	"/?api=wiki/download/:wikiPath",
	action
);

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondError(res, 400, "Invalid wikiPath.");
	}

	const wikiDirAbs = getWikiAbsolutePath(wikiPath);
	const wikiWikiDirAbs = resolve(wikiDirAbs, "wiki");
	const tempFileName = `${wikiPath}-${formatDate("YYYYMMDD-hhmmss")}.tar.gz`;
	const tempPathAbs = resolve(tmpdir(), tempFileName);

	if (await fileExists(tempPathAbs)) {
		await unlink(tempPathAbs);
	}

	const { code, stderr } = await tarGzPath(wikiWikiDirAbs, tempPathAbs);

	if (code) {
		return respondError(res, 500, `Failed to archive wiki: ${stderr}`);
	}


	const fileStat = await stat(tempPathAbs);
	res.writeHead(200, {
		"Content-Disposition": `attachment; filename="${tempFileName}"`,
		"Content-Type": "application/gzip",
		"Content-Length": fileStat.size,
		"Cache-Control": "no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: 0
	});

	var readStream = createReadStream(tempPathAbs);

	readStream.on("end", async () => {
		await unlink(tempPathAbs);
	});

	readStream.pipe(res);
}