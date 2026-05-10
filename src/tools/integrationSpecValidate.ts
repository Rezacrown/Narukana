import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";

function validateIntegrationSpec(content: string): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  const required = [
    "## Runtime Flow",
    "## UI Actions",
    "## Mappings",
    "## Contract Operations",
    "## Error Handling",
    "## Observability",
  ];

  for (const heading of required) {
    if (!content.includes(heading)) errors.push(`Missing required section: ${heading}`);
  }

  // Soft warnings
  if (!content.match(/## Mappings[\s\S]*- action:/)) warnings.push("No '- action:' mappings found under ## Mappings");
  if (!content.match(/## Contract Operations[\s\S]*- /)) warnings.push("No operations listed under ## Contract Operations");

  return { valid: errors.length === 0, warnings, errors };
}

export const narukanaIntegrationSpecValidate = tool({
  description: "Validate integration.md structure (read-only, no file writes)",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    try {
      if (!(await fileExists(fs, paths.integration()))) {
        return { output: "Integration spec not found at .narukana/specs/integration.md", metadata: { error: true } };
      }

      const content = await fs.readFile(paths.integration());
      const result = validateIntegrationSpec(content);

      if (await fileExists(fs, paths.contractJson())) {
        try {
          const contract = JSON.parse(await fs.readFile(paths.contractJson()));
          const ops = contract?.operations && typeof contract.operations === "object"
            ? Object.keys(contract.operations)
            : [];
          const unreferenced = ops.filter((op) => !content.includes(op));
          if (unreferenced.length > 0) {
            result.warnings.push(
              `Operations in contract.json not referenced in integration.md: ${unreferenced.join(", ")}`,
            );
          }
        } catch {
          result.warnings.push("Could not parse contract.json while checking operation references.");
        }
      }

      let out = `Validation results for .narukana/specs/integration.md:\n\n`;
      if (result.errors.length) {
        out += `Errors:\n${result.errors.map((e) => `- ${e}`).join("\n")}\n\n`;
      }
      if (result.warnings.length) {
        out += `Warnings:\n${result.warnings.map((w) => `- ${w}`).join("\n")}\n`;
      }

      if (!result.valid) return { output: out.trim(), metadata: { error: true } };
      return out.trim();
    } catch (error: any) {
      return { output: `Error validating integration spec: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaIntegrationSpecValidate;
