import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { getWikiPackageJson } from "./TwUtils.js";

export async function getWikiPaths() {
	return await readdir(resolve(process.cwd(), Config.Paths.Wikis));
}

export async function getWikiNginxPort(wikiPath) {
	const fileNames = await readdir(resolve(process.cwd(), Config.Paths.NginxConfigDir), "utf-8");

	for (const fileName of fileNames) {
		const bits = fileName.split(".");

		if (bits.length === 2 && bits[1] === wikiPath && Number.isInteger(parseFloat(bits[0]))) {
			return parseFloat(bits[0]);
		}
	}

	return false;
}

export async function getWikiPackageJsonPort(wikiPath) {
	try {

		const packageJson = await getWikiPackageJson(wikiPath);

		const port = parseFloat(packageJson.port);

		return Number.isInteger(port)
			? port
			: false;

	} catch (e) {
		return false;
	}
}

export async function getWikiPorts(wikiPath) {
	return {
		nginx: await getWikiNginxPort(wikiPath),
		packageJson: await getWikiPackageJsonPort(wikiPath)
	};
}