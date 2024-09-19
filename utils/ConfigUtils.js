import Config from "../config.js";

export function CONFIG_isManualNginxRestart() {
    return Config.Advanced?.ManualNginxRestart === true;
}