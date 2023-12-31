import * as fs from "node:fs";
import { resolve } from "node:path";
import { fileExists } from "../../utils/FileUtils.js";
import { getRouteData } from "../../utils/RouteUtils.js";
import { respondError } from "../respond.js";

export default getRouteData(
	"/$$assets/:rest:fileName",
	action
);

async function action(req, res) {
	const fileName = req.pathParams.fileName;

	if (!fileName || fileName.includes("..")) {
		return respondError(res, 400, "Invalid or missing filename.");
	}

	const filePath = resolve(process.cwd(), "assets", fileName);

	if (!await fileExists(filePath)) {
		return respondError(res, 400, "File not found");
	}

	const stat = await fs.promises.stat(filePath);
	res.writeHead(200, {
		"Content-Type": guessMimetype(filePath),
		"Content-Length": stat.size,
		"Cache-Control": "no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: 0
	});

	var readStream = fs.createReadStream(filePath);
	// We replaced all the event handlers with a simple call to readStream.pipe()
	readStream.pipe(res);

}

function guessMimetype(filename) {
	if (/\.css$/.test(filename)) {
		return "text/css";
	} else if (/\.js$/.test(filename)) {
		return "text/javascript";
	}

	return "text/plain";
}