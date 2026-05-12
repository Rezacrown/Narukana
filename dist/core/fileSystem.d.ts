export declare function getWorkspacePath(...segments: string[]): string;
export declare function getContextPath(file?: string): string;
export declare function getSpecsPath(file?: string): string;
export declare const paths: {
    workspace: () => string;
    narukanaJson: () => string;
    contextDir: () => string;
    specsDir: () => string;
    context: () => string;
    idea: () => string;
    uiSpec: () => string;
    contractJson: () => string;
    contractDetail: () => string;
    integration: () => string;
    plan: () => string;
    tasks: () => string;
    memory: () => string;
    codebaseInventory: () => string;
};
export declare function getBasename(filePath: string): string;
export declare function fileExists(fs: any, path: string): Promise<boolean>;
export declare function readJsonFile(fs: any, path: string): Promise<any>;
export declare function writeJsonFile(fs: any, path: string, data: any): Promise<void>;
export declare function getTimestamp(): string;
export declare function createBackupPath(originalPath: string): string;
//# sourceMappingURL=fileSystem.d.ts.map