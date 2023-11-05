import { execPromise } from "./ExecUtils.js";

export async function pm2JsonList() {
	const { stdout } = await execPromise("pm2 jlist");

	return stdout;
}

export async function getPm2DetailsForWiki(wikiName) {
	const records = JSON.parse(await pm2JsonList());
	return records.find(record => record.name === `Tiddlywiki /${wikiName}`);
}