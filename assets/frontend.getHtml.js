import { dm } from "./frontend.dm.js";

export function getHtml(wikiPath) {
	return dm("tr", {
		child: [
			dm("td", {
				class: "cell-title",
				child: dm("a", { href: `/${wikiPath}`, target: "_blank", child: dm("~spinner") })
			}),
			dm("td", { class: "cell-status", child: dm("~spinner") }),
			dm("td", {
				class: "cell-size", child: [
					dm("span", { class: "primary", child: dm("~spinner") }),
					" ",
					dm("span", { class: "secondary", child: dm("~spinner") }),
				]
			}),
			dm("td", {
				class: "cell-memory", child: [
					dm("span", { class: "primary", child: dm("~spinner") }),
					" ",
					dm("span", { class: "secondary", child: dm("~spinner") }),
				]
			}),
			dm("td", { class: "cell-tiddlers", child: dm("~spinner") }),
			dm("td", dm("button", { class: "action-show", text: "Show" }))
		]
	});
}