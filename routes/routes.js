import { readdir } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import ActionApiGetCsrfToken from "./routeApiGetCsrfToken.js";
import ActionApiGetJobInfo from "./routeApiGetJobInfo.js";
import ActionApiGetMemoryDetails from "./routeApiGetMemoryDetails.js";
import ActionApiGetPm2Status from "./routeApiGetPm2Status.js";
import ActionApiGetWikiBackups from "./routeApiGetWikiBackups.js";
import ActionApiGetWikiDetails from "./routeApiGetWikiDetails.js";
import ActionApiGetWikis from "./routeApiGetWikis.js";
import ActionApiPostBackupWiki from "./routeApiPostBackupWiki.js";
import ActionApiPostCopyWiki from "./routeApiPostCopyWiki.js";
import ActionApiPostDeleteWikiBackup from "./routeApiPostDeleteWikiBackup.js";
import ActionApiPostStopWiki from "./routeApiPostStopWiki.js";
import ActionAsset from "./routeAsset.js";
import ActionRoot from "./routeRoot.js";

export const Routes = [];

buildRoutesArray();

async function buildRoutesArray() {
	const dir = dirname(fileURLToPath(import.meta.url));
	const files = await readdir(dir);

	for (const file of files) {
		if (!file.startsWith("route")) {
			continue;
		}

		const module = await import(resolve(dir, file));
		// console.log(module);
	}
	// console.log(files);
}

export function getRoutes() {
	return [
		ActionApiPostBackupWiki,
		ActionApiPostCopyWiki,
		ActionApiPostDeleteWikiBackup,
		ActionApiPostStopWiki,
		ActionApiGetCsrfToken,
		ActionApiGetJobInfo,
		ActionApiGetMemoryDetails,
		ActionApiGetPm2Status,
		ActionApiGetWikiBackups,
		ActionApiGetWikiDetails,
		ActionApiGetWikis,
		ActionRoot,
		ActionAsset
	];
}

