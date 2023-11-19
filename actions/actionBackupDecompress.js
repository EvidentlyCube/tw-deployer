import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { universalDecompress } from "../utils/ArchiveUtils.js";
import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { createTempFilePath as createNewTempPath, fileExists } from "../utils/FileUtils.js";

export async function actionBackupDecompress(archivePath, log) {
	log(`[Action: decompress backup '${archivePath}' and  get path to wiki dir`);

	const tmpDirAbs = await createNewTempPath("backup", "");

	if (await fileExists(tmpDirAbs)) {
		throw new ActionError(`Cannot decompress to location ${tmpDirAbs} because it already exists`);
	}

	await mkdir(tmpDirAbs, { recursive: true });

	await decompress(archivePath, tmpDirAbs, log);
	const decompressedWikiPathAbs = await findWikiDirectory(tmpDirAbs, log);

	if (!decompressedWikiPathAbs) {
		throw new ActionError("Failed to find tiddlers in this file");
	}

	log(`Found path: ${decompressedWikiPathAbs}`);

	log("[/Action]");

	return decompressedWikiPathAbs;
}

async function decompress(archivePath, tmpDirAbs, log) {
	try {
		await universalDecompress(archivePath, tmpDirAbs, log);
	} catch (e) {
		throw new ActionError(e.message);
	}
}

async function findWikiDirectory(decompressedDirAbs, log) {
	const { stdout: tiddlywikiInfo } = await execPromiseLogged(`find '${decompressedDirAbs}' -type f -name tiddlywiki.info`, log);

	if (tiddlywikiInfo.trim()) {
		return dirname(tiddlywikiInfo.split("\n")[0].trim());
	}

	const { stdout: tiddlersDir } = await execPromiseLogged(`find '${decompressedDirAbs}' -type d -name tiddlers`, log);

	if (tiddlersDir.trim()) {
		return resolve(tiddlersDir.split("\n")[0].trim(), "..");
	}

	const { stdout: tidFiles } = await execPromiseLogged(`find '${decompressedDirAbs}' -type f -name '*.tid'`, log);

	if (tidFiles.trim()) {
		return resolve(dirname(tidFiles.split("\n")[0].trim()), "..");
	}

	const { stdout: jsonFiles } = await execPromiseLogged(`find '${decompressedDirAbs}' -type f -name '*.json'`, log);

	if (jsonFiles.trim()) {
		return resolve(dirname(jsonFiles.split("\n")[0].trim()), "..");
	}

	return false;
}