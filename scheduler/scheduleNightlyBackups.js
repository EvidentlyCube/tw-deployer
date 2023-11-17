import { actionBackupTiddlers } from "../actions/actionBackupTiddlers.js";
import { doNull } from "../utils/MiscUtils.js";
import { getAllWikiPaths } from "../utils/TwUtils.js";
import { registerSchedulerTask } from "./Scheduler.js";

export function registerScheduleNightlyBackups() {
	registerSchedulerTask(
		"nightly-backups",
		"Nightly backups",
		() => {
			const now = new Date();
			now.setDate(now.getDate() + 1);
			now.setHours(0);
			now.setMinutes(0);
			now.setSeconds(0);
			return now;
		},
		async () => {
			const wikis = await getAllWikiPaths();

			for (const wikiPath of wikis) {
				await actionBackupTiddlers(wikiPath, doNull);
			}
		}
	);
}