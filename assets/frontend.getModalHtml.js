import { dm } from "./frontend.dm.js";
import { formatDate } from "./frontend.utils.js";

export function getModalHtml(wikiPath) {
	return dm("div", {
		class: "modal",
		child: [
			dm("header", dm("~spinner")),
			dm("div", {
				class: "modal-actions",
				child: [
					dm("button", { class: "modal-action-backup", text: "Backup", disabled: true }),
					dm("button", { class: "modal-action-stop hide", text: "Stop", disabled: true }),
					dm("button", { class: "modal-action-start hide", text: "Start", disabled: true }),
					dm("button", { class: "modal-action-delete hide danger", text: "Delete", disabled: true }),
					dm("button", { class: "modal-action-copy", text: "Copy", disabled: true }),
				]
			}),
			dm("div", {
				class: "modal-containers",
				child: [
					getPropsTable(wikiPath),
					getBackupsContainer(wikiPath),
				]
			})
			,
			dm("div", {
				class: "modal-close",
				child: dm("button", { class: "action-close", child: "Close" })
			})
		]
	});
}

export function createBackupRowHtml(wikiPath, backupFilename, backupTimestamp) {
	return dm("div", {
		class: "modal-backup-row",
		"data-filename": backupFilename,
		"data-timestamp": backupTimestamp,
		child: [
			dm("span", {
				class: "backup-name",
				text: formatDate("YYYY-MM-DD hh:mm:ss", backupTimestamp),
			}),
			dm("button", { class: "action-delete-backup danger", text: "Delete" }),
			dm("button", { class: "action-restore-backup", text: "Restore" }),
			dm("a", {
				href: `?api=wiki/backup/${wikiPath}/${backupFilename}`,
				class: "action-download-backup button small",
				child: dm("span", { class: "gg-software-download" })
			}),
		]
	});
}

function getPropsTable(wikiPath) {
	const getRow = (header, className, value) => {
		return dm("tr", {
			class: className,
			child: [
				dm("th", header),
				dm("td", value || dm("~spinner50"))
			]
		});
	};

	return dm("div", [
		dm("h3", "Properties:"),
		dm("table", {
			class: "properties",
			child: [
				getRow("Path", "cell-path", `/${wikiPath}`),
				getRow("Port", "cell-port"),
				getRow("PID", "cell-pid"),
				getRow("PM ID", "cell-pm2-id"),
				getRow("Tiddlers", "cell-tiddlers"),
				getRow("Size (Tiddlers)", "cell-size-tiddlers"),
				getRow("Size (All)", "cell-size-all"),
				getRow("Memory Used", "cell-memory-used"),
				getRow("Memory Used %", "cell-memory-percent"),
			]
		})
	]);
}

function getBackupsContainer() {
	return dm("div", {
		class: "modal-backups",
		child: [
			dm("h3", "Backups:"),
			dm("~spinner")
		]
	});
}