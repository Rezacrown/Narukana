import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";
import { CONTEXT_TEMPLATE, IDEA_CONTEXT_TEMPLATE } from "../core/templates";

export const narukanaContextCreate = tool({
  description: "Create or regenerate context.md in .narukana/context/",
  args: {
    regenerate: tool.schema.boolean().optional().default(false),
    include: tool.schema.string().optional(),
  },
  execute: async (args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    const regenerate = args.regenerate ?? false;
    const include = args.include;

    try {
      await fs.mkdir(paths.contextDir(), { recursive: true });

      const exists = await fileExists(fs, paths.context());
      if (exists && !regenerate) {
        return {
          output:
            ".narukana/context/context.md already exists. Use regenerate:true to overwrite.",
          metadata: { error: true },
        };
      }

      if (exists && regenerate) {
        const backupPath = createBackupPath(paths.context());
        const originalContent = await fs.readFile(paths.context());
        await fs.writeFile(backupPath, originalContent);
      }

      let content: string;
      if (include && include.trim().length > 0) {
        content = include;
      } else {
        const ideaExists = await fileExists(fs, paths.idea());
        if (ideaExists) {
          const ideaContent = await fs.readFile(paths.idea());
          content =
            IDEA_CONTEXT_TEMPLATE +
            "\n---\n\n" +
            ideaContent +
            "\n\nPlease expand each section above with specific details.";
        } else {
          content = CONTEXT_TEMPLATE;
        }
      }

      await fs.writeFile(paths.context(), content);
      return `Created .narukana/context/context.md\n\n${
        regenerate ? "(Overwrote existing file - backup created)" : "(New file created)"
      }`;
    } catch (error: any) {
      return { output: `Error creating context: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaContextCreate;