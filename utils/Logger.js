import { appendFile } from "fs/promises";
import { resolve } from "path";
import Config from "../config.js";
import { formatDate } from "./DateUtils.js";


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


	return (message) => {
		appendQueue.push(`[${formatDate("YYYY-MM-DD hh:mm:ss.lll")}] ${message}`);

		options.onLog?.(message);

		if (!isPendingFlush) {
			isPendingFlush = true;
			setTimeout(flush, 500);
		}
	};
}