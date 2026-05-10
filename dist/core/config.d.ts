export interface NarukanaConfig {
    schemaVersion: number;
    projectName: string;
    paths: {
        uiRoot: string;
        contractRoot: string;
    };
}
export declare function createDefaultConfig(): NarukanaConfig;
export declare function isValidConfig(config: any): config is NarukanaConfig;
//# sourceMappingURL=config.d.ts.map