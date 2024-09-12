import { resolve } from "node:path";
import { countFiles, getDirectorySize } from "../../utils/FileUtils.js";
import { getWikiAbsolutePath, isValidWikiPath } from "../../utils/PathUtils.js";
import { getRouteData } from "../../utils/RouteUtils.js";
import { getTiddlerText, getWikiPackageJson } from "../../utils/TwUtils.js";
import { respondApiError, respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=wiki/info/:wikiPath",
	action
);

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);
	const tiddlersAbsolutePath = resolve(wikiAbsolutePath, "wiki", "tiddlers");

	const { port } = await getWikiPackageJson(wikiAbsolutePath);
	const title = await getTiddlerText(wikiPath, "$__SiteTitle.tid");
	const totalSize = await getDirectorySize(wikiAbsolutePath);
	const tiddlersSize = await getDirectorySize(tiddlersAbsolutePath);
	const tiddlersCount = await countFiles(tiddlersAbsolutePath);

	return respondApiSuccess(res, {
		port,
		title,
		tiddlersCount,
		tiddlersSize,
		totalSize,
	});
}