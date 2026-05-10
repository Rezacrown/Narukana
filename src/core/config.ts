import { SCHEMA_VERSION } from "./constants";

export interface NarukanaConfig {
  schemaVersion: number;
  projectName: string;
  paths: {
    uiRoot: string;
    contractRoot: string;
  };
}

export function createDefaultConfig(): NarukanaConfig {
  return {
    schemaVersion: SCHEMA_VERSION,
    projectName: "",
    paths: {
      uiRoot: "",
      contractRoot: "",
    },
  };
}

export function isValidConfig(config: any): config is NarukanaConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    typeof config.schemaVersion === "number" &&
    typeof config.projectName === "string" &&
    typeof config.paths === "object" &&
    config.paths !== null &&
    typeof config.paths.uiRoot === "string" &&
    typeof config.paths.contractRoot === "string"
  );
}
