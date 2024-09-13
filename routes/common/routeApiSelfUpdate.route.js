import { validateCsrfToken } from "../../utils/Csrf.js";
import { execPromiseLogged } from "../../utils/ExecUtils.js";
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
		execPromiseLogged("git pull --ff", log => console.log(log));
	}, 1000);

	return respondApiSuccess(res, true);
}