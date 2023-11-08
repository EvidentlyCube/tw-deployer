import { generateCsrfToken } from "../utils/Csrf.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=csrf-token",
	action
);

async function action(req, res) {
	respondApiSuccess(res, await generateCsrfToken());
}