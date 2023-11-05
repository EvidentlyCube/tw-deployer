import * as fs from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";

export async function routeApiPostWiki(req, res) {
	const files = await fs.readdir(resolve(process.cwd(), Config.Paths.Wikis));
	const json = JSON.stringify({
		error: null,
		body: files
	});
	res.writeHead(200, {
		"Content-Length": json.length,
		"Content-Type": "application/json",
	});
	res.write(json);
	res.end();
}