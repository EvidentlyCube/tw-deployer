import { isValidWikiPath } from "../utils/PathUtils.js";
import { routeToRegexp } from "../utils/RouteUtils.js";
import { getPm2DetailsForWiki } from "../utils/pm2.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default {
	route: routeToRegexp("/?api/pm2-status/:wikiName"),
	action
};

async function action(req, res) {
	const wikiName = req.pathParams.wikiName;

	if (!wikiName || !isValidWikiPath(wikiName)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const record = await getPm2DetailsForWiki(wikiName);

	if (!record) {
		return respondApiError(res, 404, `Failed to find process for /${wikiName}`);
	}

	return respondApiSuccess(res, {
		name: record.name,
		pid: record.pid,
		pmId: record.pm2_env.pm_id,
		status: record.pm2_env.status,
		uptime: Date.now() - record.pm2_env.pm_uptime
	});
}