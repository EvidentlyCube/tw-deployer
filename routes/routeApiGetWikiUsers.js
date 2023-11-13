import Config from "../config.js";
import { isValidWikiPath } from "../utils/PathUtils.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { getWikiUsers } from "../utils/TwUtils.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=wiki/users/:wikiPath",
	action
);

async function action(req, res) {
	const wikiPath = req.pathParams.wikiPath;

	if (!wikiPath || !isValidWikiPath(wikiPath)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const users = await getWikiUsers(wikiPath);

	respondApiSuccess(res, users.length > 0 ? users.map(user => user.username) : [Config.Username]);
}