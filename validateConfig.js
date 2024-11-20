import * as fs from "node:fs";
import { resolve } from "node:path";
import Config from "./config.js";
import { isPortOpen } from "./utils/ExecUtils.js";
import { canAccessFile, fileExists, isDirectory } from "./utils/FileUtils.js";

export async function validateConfig() {
	await validateLogPaths();
	await validateWikisPath();
	await validateNginxPath();
	await validateBackupsPath();
	await validatePort();
	await validatePortRanges();
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
		exit(`Config.Paths.Wikis=${JSON.stringify(wikisPath)} -> Failed to stat`);

	} else if (!await canAccessFile(wikisPath, fs.constants.R_OK)) {
		exit(`Config.Paths.Wikis=${JSON.stringify(wikisPath)} -> Path not readable`);

	} else if (!await canAccessFile(wikisPath, fs.constants.W_OK)) {
		exit(`Config.Paths.Wikis=${JSON.stringify(wikisPath)} -> Path not writable`);

	} else if (!await isDirectory(wikisPath)) {
		exit(`Config.Paths.Wikis=${JSON.stringify(wikisPath)} -> Not a directory`);
	}
}

async function validateNginxPath() {
	const { NginxConfigDir } = Config.Paths;

	try {
		const stat = await fs.promises.stat(NginxConfigDir);

		if (!stat.isDirectory()) {
			exit(`Config.Paths.NginxConfigDir=${JSON.stringify(NginxConfigDir)} -> Path is a file, expected a directory`);
		}

	} catch (e) {
		exit(`Config.Paths.NginxConfigDir=${JSON.stringify(NginxConfigDir)} -> Failed to stat -> ${e}`);
	}

	try {
		await fs.promises.access(NginxConfigDir, fs.constants.W_OK | fs.constants.R_OK);

	} catch (e) {
		exit(`Config.Paths.NginxConfigDir=${JSON.stringify(NginxConfigDir)} -> Invalid access -> ${e}`);
	}
}

async function validateBackupsPath() {
	const path = Config.Paths.Backups;

	if (!await fileExists(path)) {
		exit(`Config.Paths.Backups=${JSON.stringify(path)} -> Failed to stat`);

	} else if (!await canAccessFile(path, fs.constants.R_OK)) {
		exit(`Config.Paths.Backups=${JSON.stringify(path)} -> Path not readable`);

	} else if (!await canAccessFile(path, fs.constants.W_OK)) {
		exit(`Config.Paths.Backups=${JSON.stringify(path)} -> Path not writable`);

	} else if (!await isDirectory(path)) {
		exit(`Config.Paths.Backups=${JSON.stringify(path)} -> Not a directory`);
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

async function validatePortRanges() {
	const { TwPortRanges } = Config;

	if (!Array.isArray(TwPortRanges)) {
		exit("Config.TwPortRanges - Expected an array");
	}

	for (let i = 0; i < TwPortRanges.length; i++) {
		const range = TwPortRanges[i];

		if (!Array.isArray(range)) {
			exit(`Config.TwPortRanges[${i}] - Expected an array`);
		} else if (range.length !== 2) {
			exit(`Config.TwPortRanges[${i}] - Expected an array of length=2, got length=${range.length}`);
		} else if (typeof range[0] !== "number") {
			exit(`Config.TwPortRanges[${i}][0] - Expected a number type but got '${typeof range[0]}'`);
		} else if (!Number.isInteger(range[0])) {
			exit(`Config.TwPortRanges[${i}][0] - Expected an integer but got '${range[0]}'`);
		} else if (typeof range[1] !== "number") {
			exit(`Config.TwPortRanges[${i}][1] - Expected a number type but got '${typeof range[1]}'`);
		} else if (!Number.isInteger(range[1])) {
			exit(`Config.TwPortRanges[${i}][1] - Expected an integer but got '${range[1]}'`);
		} else if (range[0] > range[1]) {
			exit(`Config.TwPortRanges[${i}] - Range start is larger than range end`);
		} else if (range[1] > 65535) {
			exit(`Config.TwPortRanges[${i}] - Range is larger than the max port number`);
		}
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