import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";
import { INTEGRATION_TEMPLATE } from "../core/templates";

export const narukanaIntegrationSpecCreate = tool({
  description: "Create or regenerate integration.md spec in .narukana/specs/",
  args: {
    regenerate: tool.schema.boolean().optional().default(false),
  },
  execute: async (args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    const regenerate = args.regenerate ?? false;

    try {
      await fs.mkdir(paths.specsDir(), { recursive: true });
      const exists = await fileExists(fs, paths.integration());

      if (exists && !regenerate) {
        return {
          output:
            ".narukana/specs/integration.md already exists. Use regenerate:true to overwrite.",
          metadata: { error: true },
        };
      }

      if (exists && regenerate) {
        const backupPath = createBackupPath(paths.integration());
        await fs.writeFile(backupPath, await fs.readFile(paths.integration()));
      }

      await fs.writeFile(paths.integration(), INTEGRATION_TEMPLATE);
      return `Created .narukana/specs/integration.md\n\n${
        regenerate ? "(Overwrote existing file - backup created)" : "(New file created)"
      }`;
    } catch (error: any) {
      return { output: `Error creating integration spec: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaIntegrationSpecCreate;