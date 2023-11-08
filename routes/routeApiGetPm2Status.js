import { execPromise } from "../utils/ExecUtils.js";
import { isValidWikiPath } from "../utils/PathUtils.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { getPm2DetailsForWiki } from "../utils/pm2.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=pm2-status/:wikiName",
	action
);

async function action(req, res) {
	const wikiName = req.pathParams.wikiName;

	if (!wikiName || !isValidWikiPath(wikiName)) {
		return respondApiError(res, 400, "Invalid wiki name given");
	}

	const details = await getPm2DetailsForWiki(wikiName);

	if (!details) {
		return respondApiError(res, 404, `Failed to find process for /${wikiName}`);
	}

	return respondApiSuccess(res, {
		name: details.name,
		pid: details.pid,
		pmId: details.pm2_env.pm_id,
		status: details.pm2_env.status,
		memoryUsed: getMemoryUsed(details.pm2_env.axm_monitor["Heap Size"]),
		memoryUsedPercent: await getMemoryPercentUsed(details.pid),
		uptime: Date.now() - details.pm2_env.pm_uptime
	});
}

function getMemoryUsed(heapSize) {
	const value = parseFloat(heapSize.value);

	switch (heapSize.unit) {
		case "TiB":
			return value * (1024 ** 4);
		case "GiB":
			return value * (1024 ** 3);
		case "MiB":
			return value * (1024 ** 2);
		case "KiB":
			return value * (1024 ** 1);
		default:
			return value;
	}
}

async function getMemoryPercentUsed(processId) {
	const { stdout } = await execPromise(`ps -ax -o pid,%mem | awk '$1 == ${processId}'`);

	if (!stdout) {
		return 0;
	}

	return stdout.trim().split(" ").slice(1).join("");
}