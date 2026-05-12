import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { SCHEMA_VERSION } from "../core/constants";
import { getNarukanaFs } from "../core/narukanaFs";
import { CONTRACT_JSON_TEMPLATE, CONTRACT_DETAIL_TEMPLATE } from "../core/templates";

export const narukanaContractSpecCreate = tool({
  description:
    "Create or regenerate contract.json and contract-detail.md specs in .narukana/specs/",
  args: {
    regenerate: tool.schema.boolean().optional().default(false),
  },
  execute: async (args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    const regenerate = args.regenerate ?? false;

    try {
      await fs.mkdir(paths.specsDir(), { recursive: true });

      const jsonExists = await fileExists(fs, paths.contractJson());
      const detailExists = await fileExists(fs, paths.contractDetail());

      if (!regenerate) {
        const existing: string[] = [];
        if (jsonExists) existing.push("contract.json");
        if (detailExists) existing.push("contract-detail.md");
        if (existing.length > 0) {
          return {
            output: `These files already exist: ${existing.join(", ")}. Use regenerate:true to overwrite.`,
            metadata: { error: true },
          };
        }
      }

      if (jsonExists && regenerate) {
        const backupPath = createBackupPath(paths.contractJson());
        await fs.writeFile(backupPath, await fs.readFile(paths.contractJson()));
      }

      if (detailExists && regenerate) {
        const backupPath = createBackupPath(paths.contractDetail());
        await fs.writeFile(backupPath, await fs.readFile(paths.contractDetail()));
      }

      await fs.writeFile(
        paths.contractJson(),
        JSON.stringify(CONTRACT_JSON_TEMPLATE, null, 2),
      );
      await fs.writeFile(paths.contractDetail(), CONTRACT_DETAIL_TEMPLATE);

      return `Created .narukana/specs/contract.json and .narukana/specs/contract-detail.md\n\n${
        regenerate ? "(Overwrote existing files - backups created)" : "(New files created)"
      }`;
    } catch (error: any) {
      return { output: `Error creating contract spec: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaContractSpecCreate;