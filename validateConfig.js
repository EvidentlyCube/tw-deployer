import * as fs from "node:fs";
import { resolve } from "node:path";
import Config from "./config.js";
import { isPortOpen } from "./utils/ExecUtils.js";
import { canAccessFile, fileExists, isDirectory } from "./utils/FileUtils.js";

export async function validateConfig() {
	await validateLogPaths();
	await validateWikisPath();
	await validateNginxPath();
	await validatePort();
	await validateUsername();
	await validatePassword();
}

async function validateLogPaths() {
	const path = Config.Paths.Logs;
	const parentPath = resolve(path, "..");

	if (!await fileExists(parentPath)) {
		exit(`Config.Paths.Logs=${JSON.stringify(path)} -> Parent directory to this path does not exist. Make sure the path is correct or create at least the parent directory.`);
	} else if (!await fileExists(path)) {
		if (!await canAccessFile(parentPath, fs.constants.W_OK)) {
			exit(`Config.Paths.Logs=${JSON.stringify(path)} -> Parent directory exists but cannot manually create the final directory in it. Please create the directory manually.`);
		}

		await fs.promises.mkdir(path, { recursive: false });
	} else if (!await isDirectory(path)) {
		exit(`Config.Paths.Logs=${JSON.stringify(path)} -> Points to a file, not directory.`);
	}

	if (!await canAccessFile(path, fs.constants.W_OK)) {
		exit(`Config.Paths.Logs=${JSON.stringify(path)} -> Directory exists but is not writable.`);
	}

	const jobsPath = resolve(path, "jobs");
	if (!await fileExists(jobsPath)) {
		await fs.promises.mkdir(jobsPath);
	} else if (!await isDirectory(jobsPath)) {
		exit(`Config.Paths.Logs=${JSON.stringify(path)} -> "Jobs" in this path should be a directory but is a file.`);

	}
}

async function validateWikisPath() {
	const wikisPath = Config.Paths.Wikis;

	if (!await fileExists(wikisPath)) {
		exit(`Config.Paths.Wiki=${JSON.stringify(wikisPath)} -> Failed to stat`);

	} else if (!await canAccessFile(wikisPath, fs.constants.R_OK)) {
		exit(`Config.Paths.Wiki=${JSON.stringify(wikisPath)} -> Path not readable`);

	} else if (!await canAccessFile(wikisPath, fs.constants.W_OK)) {
		exit(`Config.Paths.Wiki=${JSON.stringify(wikisPath)} -> Path not writable`);

	} else if (!await isDirectory(wikisPath)) {
		exit(`Config.Paths.Wiki=${JSON.stringify(wikisPath)} -> Not a directory`);
	}
}

async function validateNginxPath() {
	const configPath = Config.Paths.NginxConfig;

	try {
		const stat = await fs.promises.stat(configPath);

		if (stat.isDirectory()) {
			exit(`Config.Paths.NginxConfig=${JSON.stringify(configPath)} -> Path is a directory, expected a file`);
		}

	} catch (e) {
		exit(`Config.Paths.NginxConfig=${JSON.stringify(configPath)} -> Failed to stat -> ${e}`);
	}

	try {
		await fs.promises.access(configPath, fs.constants.W_OK | fs.constants.R_OK);

	} catch (e) {
		exit(`Config.Paths.NginxConfig=${JSON.stringify(configPath)} -> Invalid access -> ${e}`);
	}
}

async function validatePort() {
	const { Port } = Config;

	if (!Port) {
		exit(`Config.Port=${JSON.stringify(Port)} -> Invalid value`);
	}

	if (!await isPortOpen(Port)) {
		exit(`Config.Port=${JSON.stringify(Port)} -> Port is already used`);
	}
}

async function validateUsername() {
	const { Username } = Config;

	if (!Username || !Username.trim()) {
		exit(`Config.Username=${JSON.stringify(Username)} -> Empty value`);
	}
}

async function validatePassword() {
	const { Password } = Config;

	if (!Password || !Password.trim()) {
		exit(`Config.Password=${JSON.stringify(Password)} -> Empty value`);
	}
}

function exit(error) {
	console.error(error);
	process.exit(1);
}