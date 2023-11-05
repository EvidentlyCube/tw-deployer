import { generateCsrfToken } from "../utils/Csrf.js";
import { routeToRegexp } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default {
	route: routeToRegexp("/?api=csrf-token"),
	action
};

async function action(req, res) {
	respondApiSuccess(res, await generateCsrfToken());
}