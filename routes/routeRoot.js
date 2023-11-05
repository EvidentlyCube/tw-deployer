import * as fs from "node:fs/promises";
import { resolve } from "node:path";
import { respond } from "./respond.js";
import { routeToRegexp } from "../utils/RouteUtils.js";

export default {
	route: routeToRegexp("/"),
	action
};

async function action(req, res) {
	const html = await fs.readFile(
		resolve(process.cwd(), "assets", "index.html"),
		"utf-8"
	);

	return respond(res, 200, html, "text/html");
}