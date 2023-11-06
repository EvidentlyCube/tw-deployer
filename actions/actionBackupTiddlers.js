import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { formatDate } from "../utils/DateUtils.js";
import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { fileExists, isDirectory } from "../utils/FileUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";

export async function actionBackupTiddlers(wikiPath, log) {
	log(`[Action: backup tiddlers from wiki '${wikiPath}'`);

	if (!await isValidWikiPath(wikiPath)) {
		throw new ActionError(`Invalid wiki path '${wikiPath}'`);
	}

	const pathToBackup = resolve(
		getWikiAbsolutePath(wikiPath),
		'wiki',
		'tiddlers'
	);

	if (!await fileExists(pathToBackup)) {
		throw new ActionError(`Path to backup '${pathToBackup}' does not exist`);
	}

	const backupDir = resolve(Config.Paths.Backups, wikiPath);

	if (!await fileExists(backupDir)) {
		await mkdir(backupDir);
	} else if (!await isDirectory(backupDir)) {
		throw new ActionError(`Cannot backup wiki because the target path '${backupDir}' is not a directory`);
	}

	const backupFilePath = resolve(
		backupDir,
		formatDate('YYYYMMDD-hhmmss-lll') + ".tar.gz"
	);
	if (await fileExists(backupFilePath)) {
		throw new ActionError(`Backup already exists on path '${backupFilePath}'`);
	}

	const { code, stdout, stderr } = await execPromiseLogged(`tar -zcf '${backupFilePath}' '${pathToBackup}'`, log);

	if (code) {
		throw new ActionError(`Wiki backup failed: ${stderr}`);
	}

	log("[/Action]");
}

function getNewEntry(wikiPath, port) {
	return [
		`location /${wikiPath} {`,
		`        proxy_pass              http://127.0.0.1:${port}/${wikiPath};`,
		"        proxy_set_header        Host             $host;",
		"        proxy_set_header        X-Real-IP        $remote_addr;",
		"        proxy_set_header        X-Forwarded-For  $proxy_add_x_forwarded_for;",
		"    }",
	].join("\n");
}