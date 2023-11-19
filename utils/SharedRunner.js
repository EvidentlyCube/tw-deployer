import { resolve } from "node:path";
import { TiddlyWiki } from "tiddlywiki";
import { getWikiAbsolutePath } from "./PathUtils.js";


export function initializeSharedRunner() {
	startSharedWiki("playground", 8090);
}

export function registerSharedWiki() {

}

export function unregisterSharedWiki() {

}

function startSharedWiki(wikiPath, port) {
	const wikiDirAbs = resolve(getWikiAbsolutePath(wikiPath), "wiki");

	const $tw = TiddlyWiki();

	$tw.boot.argv = [
		wikiDirAbs,
		"--listen",
		"credentials=users.csv",
		"\"readers=(authenticated)\"",
		"\"writers=(authenticated)\"",
		`port=${port}`,
		`path-prefix=/${wikiPath}`
	];

	$tw.hooks.addHook("th-server-command-post-start", (server, nodeServer, test) => {
		console.log(server);
		console.log(nodeServer);
		console.log(test);
	});

	$tw.boot.boot();
}

function stopSharedWiki(wikiPath) {

}