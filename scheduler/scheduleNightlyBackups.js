import { actionBackupTiddlers } from "../actions/actionBackupTiddlers.js";
import { getWikiPaths } from "../utils/WikiUtils.js";
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
		async (log) => {
			const wikis = await getWikiPaths();

			for (const wikiPath of wikis) {
				await actionBackupTiddlers(wikiPath, log);
			}
		}
	);
}