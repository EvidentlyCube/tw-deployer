import { dm } from "./frontend.dm.js";

export function getModalHtml(wikiPath) {
	const getRow = (header, className, value) => {
		return dm("tr", {
			class: className,
			child: [
				dm("th", header),
				dm("td", value || dm('~spinner50'))
			]
		});
	}

	return dm("div", {
		class: 'modal',
		child: [
			dm("header", dm('~spinner')),
			dm("div", {
				class: "modal-actions",
				child: [
					dm('button', { text: "Backup", disabled: true }),
					dm('button', { text: "Delete", disabled: true }),
					dm('button', { text: "Copy", disabled: true }),
				]
			}),
			dm("table", {
				class: "properties",
				child: [
					getRow('Path', 'cell-path', `/${wikiPath}`),
					getRow('Port', 'cell-port'),
					getRow('PID', 'cell-pid'),
					getRow('PM ID', 'cell-pm2-id'),
					getRow('Tiddlers', 'cell-tiddlers'),
					getRow('Size (Tiddlers)', 'cell-size-tiddlers'),
					getRow('Size (All)', 'cell-size-all'),
					getRow('Memory Used', 'cell-memory-used'),
					getRow('Memory Used %', 'cell-memory-percent'),
				]
			}),
			dm("div", {
				class: "modal-close",
				child: dm("button", { class: 'action-close', child: "Close" })
			})
		]
	});
}