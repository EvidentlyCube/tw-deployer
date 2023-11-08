import { execPromise } from "./ExecUtils.js";

const Pm2CacheDuration = 10 * 1000;

let lastPm2Request = null;
let lastPm2RequestPromise = null;
let lastPm2RequestTime = 0;
export async function pm2JsonList() {
	if (
		!lastPm2RequestPromise
		&& (
			!lastPm2Request
			|| lastPm2RequestTime + Pm2CacheDuration < Date.now()
		)
	) {
		lastPm2RequestPromise = execPromise("pm2 jlist");
	}

	if (lastPm2RequestPromise) {
		const { stdout } = await lastPm2RequestPromise;

		lastPm2Request = stdout;
		lastPm2RequestTime = Date.now();
		lastPm2RequestPromise = null;
	}

	return lastPm2Request;
}

export async function getPm2DetailsForWiki(wikiPath) {
	const records = JSON.parse(await pm2JsonList());
	return records.find(record => record.name === getPm2WikiName(wikiPath));
}

export function getPm2WikiName(wikiPath) {
	return `Tiddlywiki /${wikiPath}`;
}