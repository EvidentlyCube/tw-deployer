import { getRouteData } from "../../utils/RouteUtils.js";
import { getWikiPaths } from "../../utils/WikiUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=wiki/summary",
	action
);

async function action(req, res) {
	respondApiSuccess(res, await getWikiPaths());
}