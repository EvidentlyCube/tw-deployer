import ActionApiPostCopyWiki from "./routeApiCopyWiki.js";
import ActionApiGetCsrfToken from "./routeApiGetCsrfToken.js";
import ActionApiGetJobInfo from "./routeApiGetJobInfo.js";
import ActionApiGetPm2Status from "./routeApiGetPm2Status.js";
import ActionApiGetWikiDetails from "./routeApiGetWikiDetails.js";
import ActionApiGetWikis from "./routeApiGetWikis.js";
import ActionAsset from "./routeAsset.js";
import ActionRoot from "./routeRoot.js";

export function getRoutes() {
	return [
		ActionApiPostCopyWiki,
		ActionApiGetWikis,
		ActionApiGetPm2Status,
		ActionApiGetWikiDetails,
		ActionApiGetCsrfToken,
		ActionApiGetJobInfo,
		ActionRoot,
		ActionAsset
	];
}