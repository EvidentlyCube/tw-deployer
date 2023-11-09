import { actionPm2Save } from "../actions/actionPm2Save.js";
import { actionPm2Start } from "../actions/actionPm2Start.js";
import { validateCsrfToken } from "../utils/Csrf.js";
import { ApiError } from "../utils/Errors.js";
import { parseRequestBodyJson } from "../utils/HttpUtils.js";
import { doNull } from "../utils/MiscUtils.js";
import { isValidWikiPath } from "../utils/PathUtils.js";
import { assertPost, getRouteData } from "../utils/RouteUtils.js";
import { getPm2DetailsForWiki } from "../utils/pm2.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=start-wiki/:wikiPath",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", title: "" });

	const { wikiPath } = await validateParams(req);

	const details = await getPm2DetailsForWiki(wikiPath);

	if (details && details.pm2_env.status === "online") {
		throw new ApiError(409, "Wiki is online, can't be started");
	}

	await actionPm2Start(wikiPath, doNull);
	await actionPm2Save(doNull);

	respondApiSuccess(res, true);
}

async function validateParams(req) {
	await validateCsrfToken(req.body.csrf);

	const { wikiPath } = req.pathParams;
	if (!isValidWikiPath(wikiPath)) {
		throw Error("Invalid wikiPath");
	}
	return { wikiPath };
}