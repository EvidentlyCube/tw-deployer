import { dm } from "./frontend.dm.js";

export function getHtml(wikiPath) {
	const getRow = (header, className) => dm("tr", [
		dm("th", header),
		dm("td", { class: className, child: dm("~spinner") })
	]);

	return dm("div", {
		class: "wiki-card",
		child: [
			dm("h2", dm("~spinner")),
			dm("a", { class: "subtitle-link", target: "_blank", href: `/${wikiPath}`, text: `/${wikiPath}` }),
			dm("table", [
				getRow("Status", "cell-status"),
				getRow("Port", "cell-port"),
				getRow("Uptime", "cell-uptime"),
				getRow("Process ID", "cell-pid"),
				getRow("PM2 ID", "cell-pm2-id"),
			]),
			dm("div", {
				class: "buttons", child: [
					dm("button", { class: "restart", text: "Restart" }),
					dm("button", { class: "restart", text: "Users" }),
					dm("button", { class: "restart", text: "Stop" }),
				]
			})
		]
	});
}