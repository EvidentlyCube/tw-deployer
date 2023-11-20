import { getRouteData } from "../utils/RouteUtils.js";
import { getAllWikiPaths } from "../utils/TwUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=get-wikis",
	action
);

async function action(req, res) {
	respondApiSuccess(res, await getAllWikiPaths());
}