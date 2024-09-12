import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { isPortOpen } from "./ExecUtils.js";
import { isValidWikiPath } from "./PathUtils.js";
import { getWikiPackageJson } from "./TwUtils.js";
import { getWikiPaths } from "./WikiUtils.js";

/**
 * @returns Set
 */
export function getValidPorts() {
	const ports = new Set();

	Config.TwPortRanges.forEach(([from, to]) => {
		for (; from <= to; from++) {
			ports.add(from);
		}
	});

	return ports;
}

async function getNginxUsedPorts() {
	const ports = [];

	const fileNames = await readdir(resolve(process.cwd(), Config.Paths.NginxConfigDir), "utf-8");
	for (const fileName of fileNames) {
		const bits = fileName.split(".");

		if (bits.length === 2 && isValidWikiPath(bits[1]) && Number.isInteger(parseFloat(bits[0]))) {
			ports.push(parseFloat(bits[0]));
		}
	}

	return ports;
}

async function getWikiUsedPorts() {
	const ports = [];

	for (const wikiPath of await getWikiPaths()) {
		const packageJson = await getWikiPackageJson(wikiPath);

		ports.push(parseInt(packageJson.port));
	}

	return ports;
}

/**
 * @returns Promise<Set>
 */
export async function getUsedPorts() {
	const nginxPorts = await getNginxUsedPorts();
	const wikiPorts = await getWikiUsedPorts();

	return new Set([...nginxPorts, ...wikiPorts]);
}

export async function findUnusedPort() {
	const validPorts = getValidPorts();
	const usedPorts = await getUsedPorts();

	for (const port of validPorts) {
		if (!usedPorts.has(port)) {

			if (await isPortOpen(port)) {
				return port;
			}
		}
	}

	return false;
}