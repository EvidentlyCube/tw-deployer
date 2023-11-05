import { getJobInfo } from "../utils/JobRunner.js";
import { routeToRegexp } from "../utils/RouteUtils.js";
import { respondApiError, respondApiSuccess } from "./respond.js";

export default {
	route: routeToRegexp("/?api/job/:jobId"),
	action
};

async function action(req, res) {
	const jobInfo = getJobInfo(req.pathParams.jobId);

	if (jobInfo) {
		respondApiSuccess(res, jobInfo);
	} else {
		respondApiError(res, 404, "Job not found");
	}
}