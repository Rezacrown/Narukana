import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { NARUKANA_UI_ACTIONS_START, NARUKANA_UI_ACTIONS_END, NARUKANA_UI_DATA_START, NARUKANA_UI_DATA_END, } from "../core/constants";
import { getNarukanaFs } from "../core/narukanaFs";
function validateUiSpec(content) {
    const warnings = [];
    const errors = [];
    if (!content.includes("# UI Spec")) {
        errors.push("Missing '# UI Spec' heading");
    }
    if (!content.includes(NARUKANA_UI_ACTIONS_START)) {
        errors.push("Missing required anchored block: <!-- narukana-ui-actions -->");
    }
    if (!content.includes(NARUKANA_UI_ACTIONS_END)) {
        errors.push("Missing required anchored block: <!-- /narukana-ui-actions -->");
    }
    if (!content.includes(NARUKANA_UI_DATA_START)) {
        errors.push("Missing required anchored block: <!-- narukana-ui-data -->");
    }
    if (!content.includes(NARUKANA_UI_DATA_END)) {
        errors.push("Missing required anchored block: <!-- /narukana-ui-data -->");
    }
    const startIdx = content.indexOf(NARUKANA_UI_ACTIONS_START);
    const endIdx = content.indexOf(NARUKANA_UI_ACTIONS_END);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const actionsBlock = content.substring(startIdx + NARUKANA_UI_ACTIONS_START.length, endIdx);
        const actionLines = actionsBlock
            .split("\n")
            .filter((l) => l.trim().match(/^- action:/));
        if (actionLines.length === 0)
            warnings.push("UI actions block is empty");
    }
    return { valid: errors.length === 0, warnings, errors };
}
export const narukanaUiSpecValidate = tool({
    description: "Validate UI spec structure (read-only, no file writes)",
    args: {},
    execute: async (_args, ctx) => {
        const fs = getNarukanaFs(ctx.worktree);
        try {
            if (!(await fileExists(fs, paths.uiSpec()))) {
                return { output: "UI spec not found at .narukana/specs/ui.md", metadata: { error: true } };
            }
            const content = await fs.readFile(paths.uiSpec());
            const result = validateUiSpec(content);
            if (result.valid && result.warnings.length === 0) {
                return "Validation passed for .narukana/specs/ui.md";
            }
            let out = `Validation results for .narukana/specs/ui.md:\n\n`;
            if (result.errors.length) {
                out += `Errors:\n${result.errors.map((e) => `- ${e}`).join("\n")}\n\n`;
            }
            if (result.warnings.length) {
                out += `Warnings:\n${result.warnings.map((w) => `- ${w}`).join("\n")}\n`;
            }
            if (!result.valid)
                return { output: out.trim(), metadata: { error: true } };
            return out.trim();
        }
        catch (error) {
            return { output: `Error validating UI spec: ${error.message}`, metadata: { error: true } };
        }
    },
});
export default narukanaUiSpecValidate;
//# sourceMappingURL=uiSpecValidate.js.map