import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";

const contextTemplate = `# Context\n\n## Goal\nDescribe the desired outcome in one paragraph.\n\n## System Overview\n- What is being built?\n- Who are the users?\n- Where does the UI run?\n- Where does the backend/contract run?\n\n## Constraints\n- Tech stack constraints\n- Deployment constraints\n- Performance constraints\n- Security constraints\n\n## Assumptions\n- Assumptions that, if wrong, would break the design\n\n## Non-Goals\n- Explicitly list what is NOT being built\n\n## Risks\n- Biggest risks and unknowns\n`;

const ideaContextTemplate = `# Context\n\n## Goal\n(Generated from idea.md - please expand)\n\n## System Overview\n- What is being built?\n- Who are the users?\n- Where does the UI run?\n- Where does the backend/contract run?\n\n## Constraints\n- Tech stack constraints\n- Deployment constraints\n- Performance constraints\n- Security constraints\n\n## Assumptions\n- Assumptions that, if wrong, would break the design\n\n## Non-Goals\n- Explicitly list what is NOT being built\n\n## Risks\n- Biggest risks and unknowns\n\n---\n\n## Original Idea\n(Idea content from .narukana/context/idea.md)\n`;

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
            ideaContextTemplate +
            "\n---\n\n" +
            ideaContent +
            "\n\nPlease expand each section above with specific details.";
        } else {
          content = contextTemplate;
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
