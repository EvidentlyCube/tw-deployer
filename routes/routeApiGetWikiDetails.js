import { getWikiAbsolutePath, isValidWikiPath } from "../utils/PathUtils.js";
import { routeToRegexp } from "../utils/RouteUtils.js";
import { getTiddlerText, getWikiPackageJson } from "../utils/TwUtils.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default {
	route: routeToRegexp("/?api/wiki-details/:wikiPath"),
	action
};

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const wikiAbsolutePath = getWikiAbsolutePath(wikiPath);
	const packageJson = await getWikiPackageJson(wikiAbsolutePath);
	const wikiTitle = await getTiddlerText(wikiPath, "$__SiteTitle.tid");

	return respondApiSuccess(res, {
		port: packageJson.port,
		title: wikiTitle,
	});
}