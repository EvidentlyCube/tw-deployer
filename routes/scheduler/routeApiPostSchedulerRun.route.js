
import { runSchedulerTask } from "../../scheduler/Scheduler.js";
import { validateCsrfToken } from "../../utils/Csrf.js";
import { ApiError } from "../../utils/Errors.js";
import { parseRequestBodyJson } from "../../utils/HttpUtils.js";
import { doNull } from "../../utils/MiscUtils.js";
import { assertPost, getRouteData } from "../../utils/RouteUtils.js";
import { respondApiSuccess } from "../respond.js";

export default getRouteData(
	"/?api=scheduler/run/:taskId",
	action
);

async function action(req, res) {
	assertPost(req);
	await parseRequestBodyJson(req, { csrf: "" });

	const { taskId } = await validateParams(req);

	try {
		runSchedulerTask(taskId, doNull);
	} catch (e) {
		throw new ApiError(400, e.message);
	}

	respondApiSuccess(res, true);
}

async function validateParams(req) {
	await validateCsrfToken(req.body.csrf);

	return req.pathParams;
}