import Config from "../config.js";

export function debugLog(content) {
    if (Config.DebugLogging) {
        console.log(content);
    }
}