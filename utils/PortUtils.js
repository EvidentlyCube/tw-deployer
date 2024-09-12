import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config";
import { isValidWikiPath } from "./PathUtils";
import { getWikiPackageJson } from "./TwUtils";
import { getWikiPaths } from "./WikiUtils";

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

	for (const wikiPath of getWikiPaths()) {
		const packageJson = await getWikiPackageJson(wikiPath);

		ports.push(parseInt(packageJson.port));
	}

	return ports;
}

/**
 * @returns Promise<Set>
 */
export async function getUsedPorts() {
	const set = new Set([...getNginxUsedPorts(), ...getWikiUsedPorts()]);

	return set;
}