import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { isValidConfig } from "../core/config";
import { getNarukanaFs } from "../core/narukanaFs";

function parseContractOperations(content: string): string[] {
  const data = JSON.parse(content);
  if (!data.operations || typeof data.operations !== "object") return [];
  return Object.keys(data.operations);
}

async function hasEvidence(fs: any, rootPath: string, op: string): Promise<boolean> {
  const files = await fs.glob("**/*.{ts,js,sol}", { cwd: rootPath });
  for (const file of files) {
    try {
      const content = await fs.readFile(file);
      if (content.toLowerCase().includes(op.toLowerCase())) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

export const narukanaContractValidate = tool({
  description: "Deep-scan: validate contract operation implementation evidence exists (read-only)",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);

    try {
      if (!(await fileExists(fs, paths.narukanaJson()))) {
        return { output: "Config not found at .narukana/narukana.json", metadata: { error: true } };
      }
      if (!(await fileExists(fs, paths.contractJson()))) {
        return { output: "Contract spec not found at .narukana/specs/contract.json", metadata: { error: true } };
      }

      const config = JSON.parse(await fs.readFile(paths.narukanaJson()));
      if (!isValidConfig(config)) {
        return { output: "Invalid narukana.json config", metadata: { error: true } };
      }
      if (!config.paths.contractRoot) {
        return { output: "contractRoot not configured in narukana.json", metadata: { error: true } };
      }

      const contractRoot = config.paths.contractRoot;
      if (!(await fileExists(fs, contractRoot))) {
        return { output: `contractRoot path does not exist: ${contractRoot}`, metadata: { error: true } };
      }

      const ops = parseContractOperations(await fs.readFile(paths.contractJson()));
      if (ops.length === 0) return "No operations defined in contract.json";

      let out = "Deep-scan validation for contract operations:\n\n";
      for (const op of ops) {
        const ok = await hasEvidence(fs, contractRoot, op);
        out += `- ${op}: ${ok ? "FOUND" : "NOT FOUND"}\n`;
      }
      return out.trim();
    } catch (error: any) {
      return { output: `Error validating contract: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaContractValidate;
