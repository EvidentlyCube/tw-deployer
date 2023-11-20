import { validateCsrfToken } from "../../utils/Csrf.js";
import { ApiError } from "../../utils/Errors.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { isValidWikiPath } from "../../utils/PathUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { isSharedWiki, registerSharedWiki } from "../../utils/SharedRunner.js";
import { getPm2DetailsForWiki } from "../../utils/pm2.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=status/shared-wiki/register/:wikiPath",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "", title: "" });

	const { wikiPath } = await validateParams(req);

	if (isSharedWiki(wikiPath)) {
		throw new ApiError(409, "Wiki is already running in shared mode");

	} else if (await getPm2DetailsForWiki(wikiPath)) {
		throw new ApiError(409, "Wiki is already running in standalone mode");
	}

	await registerSharedWiki(wikiPath);

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