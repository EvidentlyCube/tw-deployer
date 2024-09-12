import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { actionNginxAddWiki } from "./actions/actionNginxAddWiki.js";
import { actionNginxRestart } from "./actions/actionNginxRestart.js";
import { actionPm2Delete } from "./actions/actionPm2Delete.js";
import { getAllNginxConfigs } from "./utils/NginxUtils.js";
import { getWikiAbsolutePath } from "./utils/PathUtils.js";
import { findUnusedPort } from "./utils/PortUtils.js";
import { unregisterSharedWiki } from "./utils/SharedRunner.js";
import { getWikiPackageJson } from "./utils/TwUtils.js";
import { getWikiPaths, getWikiPorts } from "./utils/WikiUtils.js";

export async function fixKnownProblems() {
	if (await hasMismatchedPorts()) {
		console.log("Found mismatched ports, auto fixing!");
		await regenerateAllPorts();
	}
}

async function hasMismatchedPorts() {
	for (const wikiPath of await getWikiPaths()) {
		const { nginx, packageJson } = await getWikiPorts(wikiPath);

		if (nginx !== packageJson || !nginx || !packageJson) {
			console.log(`Mismatched ports for wiki '${wikiPath}'. Nginx=${nginx}, Package.json=${packageJson}`);
			return true;
		}
	}

	return false;
}

async function regenerateAllPorts() {
	const log = msg => console.log(msg);

	console.log("Removing Nginx configurations...");
	for (const nginxPath of await getAllNginxConfigs()) {
		console.log(`   ...${nginxPath}`);
		rm(nginxPath);
	}
	console.log("Done");
	console.log("");

	for (const wikiPath of await getWikiPaths()) {
		console.log(`Fixing wiki ${wikiPath}...`);
		console.log("   ...pm2 removal");
		await actionPm2Delete(wikiPath, log);
		console.log("   ...unregister shared wiki");
		await unregisterSharedWiki(wikiPath);

		const newPort = await findUnusedPort();
		console.log(`   ...new port=${newPort}`);
		const packageJson = await getWikiPackageJson(wikiPath, log);

		if (!packageJson.port) {
			console.log(packageJson);
			console.error("   ...invalid package.json");
			// @FIXME - Handle wiki lacking a port
			continue;
		}

		const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);
		const packageJsonPath = resolve(wikiAbsolutePath, "package.json");

		packageJson.port = newPort; 4;
		packageJson.scripts.start = packageJson.scripts.start.replace(/port=\d+/, `port=${newPort}`);

		console.log("   ...updating package.json");
		await writeFile(
			packageJsonPath,
			JSON.stringify(packageJson, null, 4),
			"utf8"
		);
		console.log("   ...adding nginx config");
		await actionNginxAddWiki(wikiPath, newPort, log);
		console.log("Done");
	}

	await actionNginxRestart(log);
	console.log("Finished");
}