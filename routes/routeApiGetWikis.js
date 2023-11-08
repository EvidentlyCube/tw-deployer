import * as fs from "node:fs/promises";
import { resolve } from "node:path";
import Config from "../config.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=get-wikis",
	action
);

async function action(req, res) {
	const files = await fs.readdir(resolve(process.cwd(), Config.Paths.Wikis));
	respondApiSuccess(res, files);
}