import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";

function validateContractJson(content: string): {
  valid: boolean;
  warnings: string[];
  errors: string[];
  operations: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const operations: string[] = [];

  let data: any;
  try {
    data = JSON.parse(content);
  } catch {
    return {
      valid: false,
      warnings: [],
      errors: ["contract.json is not valid JSON"],
      operations: [],
    };
  }

  if (!data.schemaVersion) warnings.push("Missing schemaVersion field");
  if (!data.name || typeof data.name !== "string") errors.push("Missing or invalid 'name' field");

  if (!data.operations || typeof data.operations !== "object") {
    errors.push("Missing or invalid 'operations' object");
  } else {
    for (const [opName, op] of Object.entries<any>(data.operations)) {
      operations.push(opName);

      if (!op.type) errors.push(`Operation '${opName}' missing 'type' field`);
      if (!op.transport) errors.push(`Operation '${opName}' missing 'transport' field`);
      if (op.input === undefined) errors.push(`Operation '${opName}' missing 'input' field`);
      if (op.output === undefined) errors.push(`Operation '${opName}' missing 'output' field`);

      if (op.transport === "http") {
        if (!op.method) errors.push(`Operation '${opName}' is HTTP but missing 'method'`);
        if (!op.endpoint) errors.push(`Operation '${opName}' is HTTP but missing 'endpoint'`);
      } else if (op.transport === "contract") {
        if (!op.target) errors.push(`Operation '${opName}' is contract but missing 'target'`);
        if (!op.function) errors.push(`Operation '${opName}' is contract but missing 'function'`);
      }
    }

    if (operations.length === 0) warnings.push("No operations defined in contract.json");
  }

  return { valid: errors.length === 0, warnings, errors, operations };
}

export const narukanaContractSpecValidate = tool({
  description: "Validate contract.json structure (read-only, no file writes)",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    try {
      if (!(await fileExists(fs, paths.contractJson()))) {
        return { output: "Contract spec not found at .narukana/specs/contract.json", metadata: { error: true } };
      }

      const content = await fs.readFile(paths.contractJson());
      const result = validateContractJson(content);

      let out = `Validation results for .narukana/specs/contract.json:\n\n`;
      if (result.errors.length) {
        out += `Errors:\n${result.errors.map((e) => `- ${e}`).join("\n")}\n\n`;
      }
      if (result.warnings.length) {
        out += `Warnings:\n${result.warnings.map((w) => `- ${w}`).join("\n")}\n\n`;
      }
      if (result.operations.length) {
        out += `Operations (${result.operations.length}):\n${result.operations
          .map((o) => `- ${o}`)
          .join("\n")}\n`;
      }

      if (!result.valid) return { output: out.trim(), metadata: { error: true } };
      return out.trim();
    } catch (error: any) {
      return { output: `Error validating contract spec: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaContractSpecValidate;
