import { isValidWikiPath } from "../../utils/PathUtils.js";
import { getRouteData } from "../../utils/RouteUtils.js";
import { getSharedWikiStatus, isSharedWiki } from "../../utils/SharedRunner.js";
import { respondApiError, respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=status/shared-wiki/info/:wikiPath",
	action
);

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	if (!isSharedWiki(wikiPath)) {
		return respondApiError(res, 400, "Not a shared wiki");
	}

	return respondApiSuccess(res, {
		status: await getSharedWikiStatus(wikiPath)
	});
}