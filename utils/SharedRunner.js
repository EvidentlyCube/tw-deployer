import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { TiddlyWiki } from "tiddlywiki";
import { fileExists } from "./FileUtils.js";
import { empty } from "./MiscUtils.js";
import { getWikiAbsolutePath } from "./PathUtils.js";

const SharedWikisConfigPath = ".shared-wikis";

const registeredWikiPaths = [];
const serverMap = new Map();

export async function isSharedWiki(wikiPath) {
	return registerSharedWiki.indexOf(wikiPath) !== -1;
}

export async function getSharedWikiStatus(wikiPath) {
	if (!isSharedWiki) {
		return "offline";
	}

	const server = serverMap.get(wikiPath);

	if (!server) {
		return "shared-off";
	} else if (server === true) {
		return "shared-initializing";
	} else {
		return "shared-on";
	}
}

export async function initializeSharedRunner() {
	if (await fileExists(SharedWikisConfigPath)) {
		const contents = await readFile(SharedWikisConfigPath);
		registeredWikiPaths.push(...contents.split("\n").filter(empty));
	}

	for (const registeredWikiPath of registeredWikiPaths) {
		startSharedWiki(registeredWikiPath);
	}
}


export async function registerSharedWiki(wikiPath) {
	if (!registeredWikiPaths.includes(wikiPath)) {
		registeredWikiPaths.push(wikiPath);
		await writeFile(SharedWikisConfigPath, registeredWikiPaths.join("\n"), "utf-8");

		startSharedWiki(wikiPath);
	}
}

export async function unregisterSharedWiki(wikiPath) {
	const index = registeredWikiPaths.indexOf(wikiPath);

	if (index !== -1) {
		registeredWikiPaths.splice(index, 1);
		await writeFile(SharedWikisConfigPath, registeredWikiPaths.join("\n"), "utf-8");

		stopSharedWiki(wikiPath);
	}
}

async function startSharedWiki(wikiPath) {
	if (serverMap.has(wikiPath)) {
		// Wiki already running
		return;
	}

	serverMap.set(wikiPath, true);

	const wikiDirAbs = getWikiAbsolutePath(wikiPath);
	const packageJsonPathAbs = resolve(wikiDirAbs, "package.json");
	const packageJsonString = await readFile(packageJsonPathAbs);
	const packageJson = JSON.parse(packageJsonString);

	const wikiWikiDirAbs = resolve(wikiDirAbs, "wiki");
	const $tw = TiddlyWiki();

	$tw.boot.argv = [
		wikiWikiDirAbs,
		"--listen",
		"credentials=users.csv",
		"\"readers=(authenticated)\"",
		"\"writers=(authenticated)\"",
		`port=${packageJson.port}`,
		`path-prefix=/${wikiPath}`
	];

	return new Promise(resolve => {
		$tw.hooks.addHook("th-server-command-post-start", (twServer, nodeServer) => {
			nodeServer.on("listening", () => {
				if (serverMap.get(wikiPath) === false) {
					nodeServer.close();

				} else {
					serverMap.set(wikiPath, {
						port: packageJson.port,
						wikiPath, twServer, nodeServer
					});
				}

				resolve();
			});

		});

		$tw.boot.boot();
	});
}

function stopSharedWiki(wikiPath) {
	const server = serverMap.get(wikiPath);

	if (server === true) {
		// Started but not yet listening, mark it for asap destruction
		serverMap.set(wikiPath, false);

	} else if (server) {
		server.nodeServer.close();
		serverMap.delete(wikiPath);

	} else {
		// Not running
	}
}