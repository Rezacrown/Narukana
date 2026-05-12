import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";
import { UI_SPEC_TEMPLATE } from "../core/templates";

export const narukanaUiSpecCreate = tool({
  description: "Create or regenerate ui.md spec in .narukana/specs/",
  args: {
    regenerate: tool.schema.boolean().optional().default(false),
  },
  execute: async (args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    const regenerate = args.regenerate ?? false;

    try {
      await fs.mkdir(paths.specsDir(), { recursive: true });
      const exists = await fileExists(fs, paths.uiSpec());

      if (exists && !regenerate) {
        return {
          output: ".narukana/specs/ui.md already exists. Use regenerate:true to overwrite.",
          metadata: { error: true },
        };
      }

      if (exists && regenerate) {
        const backupPath = createBackupPath(paths.uiSpec());
        const originalContent = await fs.readFile(paths.uiSpec());
        await fs.writeFile(backupPath, originalContent);
      }

      await fs.writeFile(paths.uiSpec(), UI_SPEC_TEMPLATE);
      return `Created .narukana/specs/ui.md\n\n${
        regenerate ? "(Overwrote existing file - backup created)" : "(New file created)"
      }`;
    } catch (error: any) {
      return { output: `Error creating UI spec: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaUiSpecCreate;