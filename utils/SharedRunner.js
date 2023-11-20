import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { TiddlyWiki } from "tiddlywiki";
import { fileExists } from "./FileUtils.js";
import { empty } from "./MiscUtils.js";
import { getWikiAbsolutePath } from "./PathUtils.js";
import { CoreLog } from "./Logger.js";

const SharedWikisConfigPath = ".shared-wikis";

const registeredWikiPaths = [];
const serverMap = new Map();

export function isSharedWiki(wikiPath) {
	return registeredWikiPaths.indexOf(wikiPath) !== -1;
}

export async function getSharedWikiStatus(wikiPath) {
	if (!isSharedWiki) {
		return "offline";
	}

	const server = serverMap.get(wikiPath);

	if (!server) {
		startSharedWiki(wikiPath);

		return "shared-off";
	} else if (server === true) {
		return "shared-initializing";
	} else {
		return "shared-on";
	}
}

export async function initializeSharedRunner() {
	CoreLog("shared-runner", "Initializing");

	if (await fileExists(SharedWikisConfigPath)) {
		const contents = await readFile(SharedWikisConfigPath, "utf8");
		registeredWikiPaths.push(...contents.split("\n").filter(empty));

		CoreLog("shared-runner", `Loaded registered wikis: ${registeredWikiPaths.length}`);
	}

	for (const registeredWikiPath of registeredWikiPaths) {
		startSharedWiki(registeredWikiPath);
	}
}


export async function registerSharedWiki(wikiPath) {
	if (!registeredWikiPaths.includes(wikiPath)) {
		CoreLog("shared-runner", `Registering: ${wikiPath}`);

		registeredWikiPaths.push(wikiPath);
		await writeFile(SharedWikisConfigPath, registeredWikiPaths.join("\n"), "utf-8");

		startSharedWiki(wikiPath);

		CoreLog("shared-runner", `Registered: ${wikiPath}`);
	}
}

export async function unregisterSharedWiki(wikiPath) {
	const index = registeredWikiPaths.indexOf(wikiPath);

	if (index !== -1) {
		CoreLog("shared-runner", `Unregistering: ${wikiPath}`);

		registeredWikiPaths.splice(index, 1);
		await writeFile(SharedWikisConfigPath, registeredWikiPaths.join("\n"), "utf-8");

		stopSharedWiki(wikiPath);

		CoreLog("shared-runner", `Unregistered: ${wikiPath}`);
	}
}

async function startSharedWiki(wikiPath) {
	if (serverMap.has(wikiPath)) {
		// Wiki already running
		return;
	}

	CoreLog("shared-runner", `Starting: ${wikiPath}`);

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
			CoreLog("shared-runner", `Post Start hook received: ${wikiPath}`);

			nodeServer.on("listening", () => {
				CoreLog("shared-runner", `Listening event received: ${wikiPath}`);

				if (serverMap.get(wikiPath) === false) {
					CoreLog("shared-runner", `Instantly stopping wiki: ${wikiPath}`);
					nodeServer.close();

				} else {
					serverMap.set(wikiPath, {
						port: packageJson.port,
						wikiPath, twServer, nodeServer
					});
					CoreLog("shared-runner", `Started: ${wikiPath}`);
				}

				resolve();
			});

		});

		$tw.boot.boot();
	});
}

function stopSharedWiki(wikiPath) {
	CoreLog("shared-runner", `Stopping: ${wikiPath}`);

	const server = serverMap.get(wikiPath);

	if (server === true) {
		// Started but not yet listening, mark it for asap destruction
		serverMap.set(wikiPath, false);
		CoreLog("shared-runner", `Queued for stopping: ${wikiPath}`);

	} else if (server) {
		server.nodeServer.close();
		serverMap.delete(wikiPath);

		CoreLog("shared-runner", `Stopped: ${wikiPath}`);

	} else {
		// Not running
		CoreLog("shared-runner", `Cannot stop, wiki not found: ${wikiPath}`);
	}
}