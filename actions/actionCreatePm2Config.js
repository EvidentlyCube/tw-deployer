import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getWikiAbsolutePath } from "../utils/PathUtils.js";
import { getPm2WikiName } from "../utils/pm2.js";

export async function actionCreatePm2Config(wikiPath, port, log) {
	log(`[Action: create pm2 config in wiki '${wikiPath}' with port '${port}']`);

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);
	const pm2ConfigPath = resolve(wikiAbsolutePath, "pm2.json");
	const pm2WikiName = getPm2WikiName(wikiPath);

	const pm2Config = {
		apps: [
			{
				name: pm2WikiName,
				cwd: getWikiAbsolutePath(wikiPath),
				script: "npm",
				args: "run start",
				pmx: false,
			}
		]
	};

	await writeFile(pm2ConfigPath, JSON.stringify(pm2Config, null, 4));
	log("[/Action]");
}