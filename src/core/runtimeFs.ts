import { mkdir, stat as fsStat, readFile as fsReadFile, writeFile as fsWriteFile } from "fs/promises";
import { join, resolve, isAbsolute } from "path";

export type RuntimeFs = {
  baseDir: string;
  resolvePath(path: string): string;
  stat(path: string): Promise<any>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  mkdir(path: string, opts?: { recursive?: boolean }): Promise<void>;
  glob(pattern: string, opts?: { cwd?: string }): Promise<string[]>;
};

export function createRuntimeFs(baseDir: string): RuntimeFs {
  const resolvePath = (p: string) => {
    if (isAbsolute(p)) return p;
    // Treat paths as relative to worktree root
    return resolve(join(baseDir, p));
  };

  return {
    baseDir,
    resolvePath,
    stat: async (p: string) => fsStat(resolvePath(p)),
    readFile: async (p: string) => fsReadFile(resolvePath(p), "utf-8"),
    writeFile: async (p: string, content: string) => {
      const abs = resolvePath(p);
      // Ensure parent dir exists? (writers already mkdir their dirs)
      await fsWriteFile(abs, content, "utf-8");
    },
    mkdir: async (p: string, opts: { recursive?: boolean } = { recursive: true }) => {
      await mkdir(resolvePath(p), { recursive: opts.recursive ?? true });
    },
    glob: async (pattern: string, opts: { cwd?: string } = {}) => {
      const cwd = resolvePath(opts.cwd ?? ".");
      const g = new Bun.Glob(pattern);
      const results: string[] = [];
      for await (const file of g.scan({ cwd, onlyFiles: true })) {
        results.push(join(cwd, file));
      }
      return results;
    },
  };
}
