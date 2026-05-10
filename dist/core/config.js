import { SCHEMA_VERSION } from "./constants";
export function createDefaultConfig() {
    return {
        schemaVersion: SCHEMA_VERSION,
        projectName: "",
        paths: {
            uiRoot: "",
            contractRoot: "",
        },
    };
}
export function isValidConfig(config) {
    return (typeof config === "object" &&
        config !== null &&
        typeof config.schemaVersion === "number" &&
        typeof config.projectName === "string" &&
        typeof config.paths === "object" &&
        config.paths !== null &&
        typeof config.paths.uiRoot === "string" &&
        typeof config.paths.contractRoot === "string");
}
//# sourceMappingURL=config.js.map