import Config from "../config.js";

export function CONFIG_isManualNginxRestart() {
    return Config.Advanced?.ManualNginxRestart === true;
}

export function CONFIG_isPm2Enabled() {
    return Config.Advanced?.OnlyShared !== true;
}