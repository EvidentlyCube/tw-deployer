import * as fs from "node:fs/promises";

export async function fileExists(path) {
	try {
		await fs.stat(path);

		return true;

	} catch (e) {
		return false;
	}

}

export async function isDirectory(path) {
	try {
		return (await fs.stat(path)).isDirectory();

	} catch (e) {
		return false;
	}

}

export async function canAccessFile(path, access) {
	try {
		await fs.access(path, access);

		return true;

	} catch (e) {
		return false;
	}

}

