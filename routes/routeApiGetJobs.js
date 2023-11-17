import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=jobs",
	action
);

async function action(req, res) {
	const jobLogsDirAbs = resolve(Config.Paths.Logs, "jobs");
	const files = await readdir(jobLogsDirAbs, { withFileTypes: true });

	const logs = [];
	for (const file of files) {
		if (!file.name.endsWith(".meta")) {
			continue;
		}

		const fileData = await readFile(resolve(file.path, file.name), "utf-8");

		try {
			logs.push(JSON.parse(fileData));

		} catch (e) {
			// Ignore
		}
	}

	respondApiSuccess(res, logs);
}