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
import ActionAsset from "./routeAsset.js";
import ActionRoot from "./routeRoot.js";

export function getRoutes() {
	return [
		ActionApiPostBackupWiki,
		ActionApiPostCopyWiki,
		ActionApiPostDeleteWikiBackup,
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