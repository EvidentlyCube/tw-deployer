import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { formatDate } from "../utils/DateUtils.js";
import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";
import { fileExists } from "../utils/FileUtils.js";

export async function actionUntarWiki(tarPath, log) {
	log(`[Action: unpack tar '${tarPath}'`);

	const tmpDirAbs = resolve(
		tmpdir(),
		formatDate("YYYYMMDD-hhmmss-wiki")
	);

	if (await fileExists(tmpDirAbs)) {
		throw new ActionError(`Cannot untar to location ${tmpDirAbs} because it already exists`);
	}

	await mkdir(tmpDirAbs);

	await untar(tarPath, tmpDirAbs, log);

	await execPromiseLogged(`find '${tmpDirAbs}' -name tiddlywiki.info -type f`, log);
	await execPromiseLogged(`find '${tmpDirAbs}' -name tiddlers -type d`, log);

	log("[/Action]");
}

async function untar(tarPath, tmpDirAbs, log) {
	const { code, stderr } = await execPromiseLogged(`tar -xf ${tarPath} -C ${tmpDirAbs}`, log);

	if (code) {
		throw new ActionError(`Failed to untar with error: ${stderr}`);
	}

}