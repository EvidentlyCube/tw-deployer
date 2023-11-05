import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileExists } from "./FileUtils.js";
import { getTiddlerAbsolutePath, getWikiAbsolutePath } from "./PathUtils.js";

export async function getTiddlerText(wikiPath, tiddlerName) {
	const path = getTiddlerAbsolutePath(wikiPath, tiddlerName);

	const content = await readFile(path, "utf8");
	const lines = content.split("\n");

	while (lines.length > 0 && lines[0].includes(":")) {
		lines.shift();
	}

	return lines.join("\n").trim();
}

export function createTiddlerContent(fields) {
	const rows = [];

	for (const field in fields) {
		if (field !== "text") {
			rows.push(`${field}: ${fields[field]}`);
		}
	}

	if (fields.text) {
		rows.push("");
		rows.push(fields.text);
	}

	return rows.join("\n");
}

export async function getWikiPackageJson(wikiPath, log) {
	log = log ?? function () { };

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);
	const packageJsonPath = resolve(wikiAbsolutePath, "package.json");

	if (!await fileExists(packageJsonPath)) {
		log("No preexisting package.json found");
		return {};
	}

	const content = await readFile(packageJsonPath, "utf-8");
	log(`Read package.json which was ${content.length} characters long`);

	try {
		const json = JSON.parse(content);

		if (typeof json !== "object") {
			log(`Read package.json which was ${content.length} characters long`);
			return {};
		}

		return json;

	} catch (e) {
		log(`Error reading package JSON: ${String(e)}`);
		return {};
	}
}

export async function rmTiddler(wikiPath, tiddlerFileName) {
	try {
		await rm(getTiddlerAbsolutePath(wikiPath, tiddlerFileName));
	} catch (e) {
		// Silently Ignore
	}
}

export async function writeTiddler(wikiPath, tiddlerFileName, fields) {
	await writeFile(
		getTiddlerAbsolutePath(wikiPath, tiddlerFileName),
		createTiddlerContent(fields),
		"utf8"
	);
}