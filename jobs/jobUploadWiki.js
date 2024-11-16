import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { actionBackupDecompress } from "../actions/actionBackupDecompress.js";
import { actionCreatePm2Config } from "../actions/actionCreatePm2Config.js";
import { actionDetermineWikiPort } from "../actions/actionDetermineWikiPort.js";
import { actionNginxAddWiki } from "../actions/actionNginxAddWiki.js";
import { actionNginxRestart } from "../actions/actionNginxRestart.js";
import { actionNpmInstallDependency } from "../actions/actionNpmInstallDependency.js";
import { actionPm2Delete } from "../actions/actionPm2Delete.js";
import { actionPreparePackageJson } from "../actions/actionPreparePackageJson.js";
import { actionTiddlerUpdateHost } from "../actions/actionTiddlerUpdateHost.js";
import { actionTiddlerUpdateTitle } from "../actions/actionTiddlerUpdateTitle.js";
import { actionWikiCleanup } from "../actions/actionWikiCleanup.js";
import { actionWikiCreate } from "../actions/actionWikiCreate.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { fileExists } from "../utils/FileUtils.js";
import { startJob } from "../utils/JobRunner.js";
import { LockTypeWikiAction, acquireLock, releaseLock } from "../utils/LockUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function startJobUploadWiki(
	title,
	wikiPath,
	archivePathAbs
) {
	if (!acquireLock(LockTypeWikiAction)) {
		throw Error("Server is busy processing wiki creation, please wait for the operation to finish.");
	}

	try {
		return startJob(
			`Create new wiki from provided archive in '${wikiPath}'`,
			log => runJob(log, title, wikiPath, archivePathAbs)
		);

	} finally {
		releaseLock(LockTypeWikiAction);
	}
}

async function runJob(log, title, wikiPath, archivePathAbs) {
	log("Job started");

	await validateParams(title, wikiPath, archivePathAbs);

	const port = await actionDetermineWikiPort(wikiPath, log);

	const wikiDirAbs = getWikiAbsolutePath(wikiPath);
	const decompressedWikiPathAbs = await actionBackupDecompress(archivePathAbs, log);

	await mkdir(wikiDirAbs);
	await execPromiseLogged(`mv '${decompressedWikiPathAbs}' '${join(wikiDirAbs, 'wiki')}'`, log);

	await actionWikiCreate(wikiPath, log);
	await actionPreparePackageJson(wikiPath, port, log);
	await actionNpmInstallDependency(wikiPath, "tiddlywiki", log);

	await actionTiddlerUpdateHost(wikiPath, log);
	await actionTiddlerUpdateTitle(wikiPath, title, log);
	await actionWikiCleanup(wikiPath, log);

	await actionCreatePm2Config(wikiPath, port, log);
	await actionPm2Delete(wikiPath, log);
	await actionNginxAddWiki(wikiPath, port, log);
	await actionNginxRestart(log);

	log("Job finished");
}

async function validateParams(title, wikiPath, archivePathAbs) {
	if (!title) {
		throw Error("Missing `title`");
	} else if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}

	const wikiAbsPath = getWikiAbsolutePath(wikiPath);

	if (await fileExists(wikiAbsPath)) {
		throw Error(`Wiki already exists in ${archivePathAbs}`);
	} else if (!await fileExists(archivePathAbs)) {
		throw Error(`Provided archive ${archivePathAbs} does not exist`);
	}
}
