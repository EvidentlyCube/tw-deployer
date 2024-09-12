import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";

export async function findNginxConfigPath(wikiPath) {
	const dir = resolve(process.cwd(), Config.Paths.NginxConfigDir);
	const fileNames = await readdir(dir, "utf-8");

	for (const fileName of fileNames) {
		const bits = fileName.split(".");

		if (bits.length === 2 && bits[1] === wikiPath) {
			return resolve(dir, fileName);
		}
	}

	return false;
}

export async function getAllNginxConfigs() {
	const dir = resolve(process.cwd(), Config.Paths.NginxConfigDir);
	const fileNames = await readdir(dir, "utf-8");

	return fileNames.map(fileName => resolve(dir, fileName));
}