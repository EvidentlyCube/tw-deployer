import { getRouteData } from "../utils/RouteUtils.js";
import { getWikiPaths } from "../utils/WikiUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=get-wikis",
	action
);

async function action(req, res) {
	respondApiSuccess(res, getWikiPaths());
}