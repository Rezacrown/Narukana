import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { createDefaultConfig } from "../core/config";
import { getNarukanaFs } from "../core/narukanaFs";
const contextTemplate = `# Context\n\n## Goal\nDescribe the desired outcome in one paragraph.\n\n## System Overview\n- What is being built?\n- Who are the users?\n- Where does the UI run?\n- Where does the backend/contract run?\n\n## Constraints\n- Tech stack constraints\n- Deployment constraints\n- Performance constraints\n- Security constraints\n\n## Assumptions\n- Assumptions that, if wrong, would break the design\n\n## Non-Goals\n- Explicitly list what is NOT being built\n\n## Risks\n- Biggest risks and unknowns\n`;
const uiSpecTemplate = `# UI Spec\n\n## Description\nA short description of the UI and what it enables.\n\n## Layout / Components\n- List primary screens/components\n\n## States\n- loading\n- empty\n- error\n- success\n\n<!-- narukana-ui-actions -->\n- action: (define your UI actions here)\n<!-- /narukana-ui-actions -->\n\n<!-- narukana-ui-data -->\n- entity: (define your data entities here)\n<!-- /narukana-ui-data -->\n\n## User Flow\n1) User opens app\n2) User triggers an action\n3) UI calls an operation\n4) UI updates state\n`;
const contractJsonTemplate = {
    schemaVersion: 1,
    name: "",
    domain: "",
    operations: {},
};
const contractDetailTemplate = `# Contract / API Details\n\n> This file explains each operation from \`contract.json\` in human terms.\n\n## Operation: (operation-name)\n- Type: (query | mutation | event | job)\n- Transport: (http | contract)\n\n### Purpose\nDescribe what this operation does.\n\n### Input\n- (input field): (type)\n\n### Output\n- (output field): (type)\n\n### Errors\n- (error cases)\n\n### Notes\n- (additional notes)\n`;
const integrationTemplate = `# Integration Flow\n\n## Runtime Flow\nUI action → operation call → response → UI state update\n\n## Mappings\n- action: (UI action name)\n  calls:\n    - op: (operation name)\n  success:\n    - ui: (success state update)\n  error:\n    - ui: (error state update)\n\n## Contract Operations\n- (operation name)\n\n## Error Handling\n- Standardize error surface to user-friendly messages\n\n## Observability\n- Log errors with action + op + correlation id\n`;
export const narukanaInit = tool({
    description: "Initialize Narukana workspace with required directories and default template files",
    args: {},
    execute: async (_args, ctx) => {
        const fs = getNarukanaFs(ctx.worktree);
        try {
            // Always ensure directories exist
            await fs.mkdir(paths.contextDir(), { recursive: true });
            await fs.mkdir(paths.specsDir(), { recursive: true });
            // Create default files if missing
            if (!(await fileExists(fs, paths.narukanaJson()))) {
                const defaultConfig = createDefaultConfig();
                await fs.writeFile(paths.narukanaJson(), JSON.stringify(defaultConfig, null, 2));
            }
            if (!(await fileExists(fs, paths.context()))) {
                await fs.writeFile(paths.context(), contextTemplate);
            }
            if (!(await fileExists(fs, paths.uiSpec()))) {
                await fs.writeFile(paths.uiSpec(), uiSpecTemplate);
            }
            if (!(await fileExists(fs, paths.contractJson()))) {
                await fs.writeFile(paths.contractJson(), JSON.stringify(contractJsonTemplate, null, 2));
            }
            if (!(await fileExists(fs, paths.contractDetail()))) {
                await fs.writeFile(paths.contractDetail(), contractDetailTemplate);
            }
            if (!(await fileExists(fs, paths.integration()))) {
                await fs.writeFile(paths.integration(), integrationTemplate);
            }
            return `Narukana workspace initialized/verified at .narukana/.\n\nEnsured:\n- .narukana/context/\n- .narukana/specs/\n\nDefault files (created if missing):\n- .narukana/narukana.json\n- .narukana/context/context.md\n- .narukana/specs/ui.md\n- .narukana/specs/contract.json\n- .narukana/specs/contract-detail.md\n- .narukana/specs/integration.md`;
        }
        catch (error) {
            return {
                output: `Error initializing Narukana workspace: ${error.message}`,
                metadata: { error: true },
            };
        }
    },
});
export default narukanaInit;
//# sourceMappingURL=init.js.map