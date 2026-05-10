export type RuntimeFs = {
    baseDir: string;
    resolvePath(path: string): string;
    stat(path: string): Promise<any>;
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    mkdir(path: string, opts?: {
        recursive?: boolean;
    }): Promise<void>;
    glob(pattern: string, opts?: {
        cwd?: string;
    }): Promise<string[]>;
};
export declare function createRuntimeFs(baseDir: string): RuntimeFs;
//# sourceMappingURL=runtimeFs.d.ts.map