import { dm } from "./frontend.dm.js";
import { formatDate } from "./frontend.utils.js";

export function getJobsRowHtml(name, startTimestamp) {
	return dm("tr", {
		child: [
			dm("td", {
				class: "cell-name",
				text: name
			}),
			dm("td", {
				class: "cell-started",
				text: formatDate("YYYY-MM-DD hh:mm:ss", startTimestamp)
			}),
			dm("td", {
				class: "cell-actions",
				child: dm("button", { class: "action-show-logs small", child: dm("~gg-layout-list") }),
			})
		]
	});
}