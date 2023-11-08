import { ActionError } from "../utils/Errors.js";
import { execPromiseLogged } from "../utils/ExecUtils.js";

export async function actionNginxRestart(log) {
	log("[Action: restart nginx]");

	const { code } = await execPromiseLogged("sudo service nginx reload", log);
	if (code) {
		throw new ActionError(`"sudo service nginx reload" responded with code: ${code}`);
	}

	log("[/Action]");
}