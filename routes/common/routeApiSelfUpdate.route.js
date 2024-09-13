import { validateCsrfToken } from "../../utils/Csrf.js";
import { execPromise } from "../../utils/ExecUtils.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=system/self-update",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "" });
	await validateCsrfToken(req.body.csrf);

	setTimeout(() => {
		execPromise("git pull --ff");
	}, 1000);

	return respondApiSuccess(res, true);
}