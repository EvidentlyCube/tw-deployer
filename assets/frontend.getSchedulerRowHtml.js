import { dm } from "./frontend.dm.js";
import { formatDate } from "./frontend.utils.js";

export function getSchedulerRowHtml(id, name, nextRunTimestamp) {
	return dm("tr", {
		child: [
			dm("td", {
				class: "cell-id",
				text: id
			}),
			dm("td", {
				class: "cell-name",
				text: name
			}),
			dm("td", {
				class: "cell-next-run",
				text: formatDate("YYYY-MM-DD hh:mm:ss", nextRunTimestamp)
			}),
			dm("td", {
				class: "cell-actions",
				child: dm("button", { class: "action-run-job small", child: dm("~gg-stopwatch") }),
			})
		]
	});
}