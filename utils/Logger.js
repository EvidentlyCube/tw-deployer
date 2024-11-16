import { appendFile } from "fs/promises";
import { resolve } from "path";
import Config from "../config.js";
import { formatDate } from "./DateUtils.js";
import { debugLog } from "./debugLog.js";

export function createLogger(path, options) {
	if (path.includes("..")) {
		throw new Error(`Cannot create logger with path "${path}" that includes ".."`);
	} else if (path.startsWith("/")) {
		throw new Error(`Cannot create logger with path "${path}" that starts with "/"`);
	} else if (path.startsWith("\\")) {
		throw new Error(`Cannot create logger with path "${path}" that starts with "\\"`);
	}

	options = options ?? {};

	const logFilePath = resolve(Config.Paths.Logs, path);
	debugLog(`- Creating logger for path ${logFilePath}`);

	let isPendingFlush = false;
	const appendQueue = [];
	const flush = async () => {
		const toFlush = appendQueue.join("\n") + "\n";
		appendQueue.length = 0;

		await appendFile(logFilePath, toFlush, { encoding: "utf-8" });

		if (appendQueue.length > 0) {
			setTimeout(flush, 500);
		} else {
			isPendingFlush = false;
		}
	};

	return (type, message) => {
		if (message === undefined) {
			message = type;
			type = undefined;
		}

		const now = Date.now();
		const typePrefix = type ? `<${type}> ` : "";
		appendQueue.push(`[${formatDate("YYYY-MM-DD hh:mm:ss.lll", now)}] ${typePrefix}${message}`);

		if (options.consoleOutput) {
			if (options.consoleOutputIncludeDate) {
				console.log(`[${formatDate("YYYY-MM-DD hh:mm:ss.lll", now)}] ${typePrefix}${message}`);
			} else {
				console.log(`${typePrefix}${message}`);
			}
		}

		options.onLog?.(message);

		if (options.write && !isPendingFlush) {
			isPendingFlush = true;
			setTimeout(flush, 500);
		}
	};
}

export const CoreLog = createLogger("core.log", {
	write: Config.Logs?.StoreCoreLogs ?? false,
	consoleOutput: Config.Logs?.OutputCoreLogsToConsole ?? false,
	consoleOutputIncludeDate: false,
});

export const AccessLog = createLogger("access.log", {
	write: Config.Logs?.StoreAccessLogs ?? false,
	consoleOutput: Config.Logs?.OutputAccessLogsToConsole ?? false,
	consoleOutputIncludeDate: false,
});