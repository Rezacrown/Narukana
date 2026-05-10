import { mkdir, stat as fsStat, readFile as fsReadFile, writeFile as fsWriteFile } from "fs/promises";
import { join, resolve, isAbsolute } from "path";
export function createRuntimeFs(baseDir) {
    const resolvePath = (p) => {
        if (isAbsolute(p))
            return p;
        // Treat paths as relative to worktree root
        return resolve(join(baseDir, p));
    };
    return {
        baseDir,
        resolvePath,
        stat: async (p) => fsStat(resolvePath(p)),
        readFile: async (p) => fsReadFile(resolvePath(p), "utf-8"),
        writeFile: async (p, content) => {
            const abs = resolvePath(p);
            // Ensure parent dir exists? (writers already mkdir their dirs)
            await fsWriteFile(abs, content, "utf-8");
        },
        mkdir: async (p, opts = { recursive: true }) => {
            await mkdir(resolvePath(p), { recursive: opts.recursive ?? true });
        },
        glob: async (pattern, opts = {}) => {
            const cwd = resolvePath(opts.cwd ?? ".");
            const g = new Bun.Glob(pattern);
            const results = [];
            for await (const file of g.scan({ cwd, onlyFiles: true })) {
                results.push(join(cwd, file));
            }
            return results;
        },
    };
}
//# sourceMappingURL=runtimeFs.js.map