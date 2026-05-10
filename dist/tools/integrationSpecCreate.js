import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";
const integrationTemplate = `# Integration Flow\n\n## Runtime Flow\nUI action → operation call → response → UI state update\n\n## Mappings\n- action: (UI action name)\n  calls:\n    - op: (operation name)\n  success:\n    - ui: (success state update)\n  error:\n    - ui: (error state update)\n\n## Contract Operations\n- (operation name)\n\n## Error Handling\n- Standardize error surface to user-friendly messages\n\n## Observability\n- Log errors with action + op + correlation id\n`;
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
                    output: ".narukana/specs/integration.md already exists. Use regenerate:true to overwrite.",
                    metadata: { error: true },
                };
            }
            if (exists && regenerate) {
                const backupPath = createBackupPath(paths.integration());
                await fs.writeFile(backupPath, await fs.readFile(paths.integration()));
            }
            await fs.writeFile(paths.integration(), integrationTemplate);
            return `Created .narukana/specs/integration.md\n\n${regenerate ? "(Overwrote existing file - backup created)" : "(New file created)"}`;
        }
        catch (error) {
            return { output: `Error creating integration spec: ${error.message}`, metadata: { error: true } };
        }
    },
});
export default narukanaIntegrationSpecCreate;
//# sourceMappingURL=integrationSpecCreate.js.map