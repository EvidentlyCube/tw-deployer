import { CONFIG_isManualNginxRestart } from "../utils/ConfigUtils.js";
import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";

export async function actionNginxRestart(log) {
	log("[Action: restart nginx]");

	if (CONFIG_isManualNginxRestart()) {
		log("Skipping, manual nginx restart enabled.");
	} else {
		const { code } = await execPromiseLogged("sudo service nginx reload", log);
		if (code) {
			throw new ActionError(`"sudo service nginx reload" responded with code: ${code}`);
		}
	}

	log("[/Action]");
}