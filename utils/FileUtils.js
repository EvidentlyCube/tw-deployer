import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, resolve } from "node:path";
import { formatDate } from "../assets/frontend.utils.js";
import { execPromise } from "./ExecUtils.js";
import { sleep } from "./MiscUtils.js";

export function getFileExtension(filename) {
	if (filename.endsWith(".tar.gz")) {
		return "tar.gz";
	} else {
		return extname(filename);
	}
}

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

export async function getDirectorySize(path) {
	const { code, stdout, stderr } = await execPromise(`du -s --block-size=1 '${path}'`);

	if (code) {
		throw new Error(`Failed to get size of the directory '${path}': ${stderr}`);
	}

	const bits = stdout.split("\t");
	const size = parseInt(bits[0]);

	if (Number.isNaN(size)) {
		throw new Error(`Failed to get size of the directory '${path}': received size ${size} is not a number`);
	} else if (!Number.isFinite(size)) {
		throw new Error(`Failed to get size of the directory '${path}': received size ${size} is infinite`);
	}

	return size;
}

export async function countFiles(path) {
	const { code, stdout, stderr } = await execPromise(`find '${path}' -type f | wc -l`);

	if (code) {
		throw new Error(`Failed to get file count of the directory '${path}': ${stderr}`);
	}

	const fileCount = parseInt(stdout);

	if (Number.isNaN(fileCount)) {
		throw new Error(`Failed to get file count of the directory '${path}': response ${fileCount} is not a number`);
	} else if (!Number.isFinite(fileCount)) {
		throw new Error(`Failed to get file count of the directory '${path}': response ${fileCount} is infinite`);
	}

	return fileCount;
}

export async function createTempFilePath(name, extension) {
	extension = extension.replace(/^\.+|\.+$/g, "");

	const tmpDirAbs = tmpdir();

	let attempts = 0;
	while (attempts++ < 100) {
		const fileName = `${name}-${formatDate("YYYYMMDD-hhmmss-lll")}${extension ? "." + extension : ""}`;
		const fileAbsPath = resolve(tmpDirAbs, fileName);

		if (!await fileExists(fileAbsPath)) {
			return fileAbsPath;
		}

		await sleep(1);
	}

	throw new Error(`Failed to generate temp file path for extension ${extension}`);
}