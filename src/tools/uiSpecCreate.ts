import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";

const uiSpecTemplate = `# UI Spec\n\n## Description\nA short description of the UI and what it enables.\n\n## Layout / Components\n- List primary screens/components\n\n## States\n- loading\n- empty\n- error\n- success\n\n<!-- narukana-ui-actions -->\n- action: (define your UI actions here)\n<!-- /narukana-ui-actions -->\n\n<!-- narukana-ui-data -->\n- entity: (define your data entities here)\n<!-- /narukana-ui-data -->\n\n## User Flow\n1) User opens app\n2) User triggers an action\n3) UI calls an operation\n4) UI updates state\n`;

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

      await fs.writeFile(paths.uiSpec(), uiSpecTemplate);
      return `Created .narukana/specs/ui.md\n\n${
        regenerate ? "(Overwrote existing file - backup created)" : "(New file created)"
      }`;
    } catch (error: any) {
      return { output: `Error creating UI spec: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaUiSpecCreate;
