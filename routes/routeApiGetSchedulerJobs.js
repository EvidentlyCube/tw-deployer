import { getSchedulerJobs } from "../scheduler/Scheduler.js";
import { getRouteData } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default getRouteData(
	"/?api=scheduler/jobs",
	action
);

async function action(req, res) {
	return respondApiSuccess(res, getSchedulerJobs());
}