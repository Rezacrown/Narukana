import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { isValidConfig } from "../core/config";
import { parseUIActions, parseContractOperations, parseIntegrationMappings } from "../core/markdownParsers";
import { getNarukanaFs } from "../core/narukanaFs";

async function searchInDirectory(
  fs: any,
  rootPath: string,
  terms: string[],
): Promise<boolean> {
  const files = await fs.glob("**/*.{ts,tsx,js,jsx,sol}", { cwd: rootPath });
  for (const file of files) {
    try {
      const content = await fs.readFile(file);
      for (const term of terms) {
        if (content.toLowerCase().includes(term.toLowerCase())) return true;
      }
    } catch {
      // ignore
    }
  }
  return false;
}

export const narukanaIntegrationValidate = tool({
  description:
    "Deep-scan: validate integration consistency between UI and backend/contract (read-only)",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);

    try {
      if (!(await fileExists(fs, paths.narukanaJson()))) {
        return { output: "Config not found at .narukana/narukana.json", metadata: { error: true } };
      }

      const requiredFiles = [paths.uiSpec(), paths.contractJson(), paths.integration()];
      for (const p of requiredFiles) {
        if (!(await fileExists(fs, p))) {
          return { output: `Required file not found: ${p}`, metadata: { error: true } };
        }
      }

      const config = JSON.parse(await fs.readFile(paths.narukanaJson()));
      if (!isValidConfig(config)) {
        return { output: "Invalid narukana.json config", metadata: { error: true } };
      }
      if (!config.paths.uiRoot || !config.paths.contractRoot) {
        return { output: "uiRoot and contractRoot must be configured in narukana.json", metadata: { error: true } };
      }

      const uiSpec = await fs.readFile(paths.uiSpec());
      const contractJson = await fs.readFile(paths.contractJson());
      const integrationMd = await fs.readFile(paths.integration());

      const uiActions = parseUIActions(uiSpec);
      const contractOps = parseContractOperations(contractJson);
      const integration = parseIntegrationMappings(integrationMd);

      const missingMappingsInIntegration: string[] = [];
      const noUiEvidence: string[] = [];
      const noBackendEvidence: string[] = [];
      const unusedOps: string[] = [];
      const unmappedActions: string[] = [];

      if (!integration.hasMappingsSection) {
        missingMappingsInIntegration.push("## Mappings section is missing");
      } else {
        if (integration.actions.length === 0) {
          missingMappingsInIntegration.push("No '- action:' entries were found under ## Mappings");
        }
      }

      for (const action of uiActions) {
        if (!integration.actions.includes(action)) unmappedActions.push(action);
        const opsForAction = integration.actionToOperations[action] || [];
        if (integration.hasMappingsSection && integration.actions.includes(action) && opsForAction.length === 0) {
          missingMappingsInIntegration.push(`Action "${action}" has no mapped operations`);
        }
      }
      for (const op of contractOps) {
        if (!integration.operations.includes(op)) unusedOps.push(op);
      }

      for (const action of integration.actions) {
        const ok = await searchInDirectory(fs, config.paths.uiRoot, [
          action.toLowerCase(),
          action.toLowerCase().replace(/\s+/g, ""),
        ]);
        if (!ok) noUiEvidence.push(action);
      }

      for (const op of integration.mappedOperations) {
        if (op === "(none)" || op === "none") continue;
        const ok = await searchInDirectory(fs, config.paths.contractRoot, [op]);
        if (!ok) noBackendEvidence.push(op);
      }

      let out = "Integration validation results:\n\n";
      if (missingMappingsInIntegration.length) {
        out += `Missing mappings in integration.md:\n${missingMappingsInIntegration
          .map((m) => `- ${m}`)
          .join("\n")}\n\n`;
      }
      if (unmappedActions.length) {
        out += `UI actions defined but unmapped:\n${unmappedActions
          .map((a) => `- ${a}`)
          .join("\n")}\n\n`;
      }
      if (unusedOps.length) {
        out += `Operations defined but unused:\n${unusedOps.map((o) => `- ${o}`).join("\n")}\n\n`;
      }
      if (noUiEvidence.length) {
        out += `Mappings with no UI evidence:\n${noUiEvidence.map((a) => `- ${a}`).join("\n")}\n\n`;
      }
      if (noBackendEvidence.length) {
        out += `Mappings with no backend/contract evidence:\n${noBackendEvidence
          .map((o) => `- ${o}`)
          .join("\n")}\n\n`;
      }

      const hasIssues =
        missingMappingsInIntegration.length > 0 ||
        unmappedActions.length > 0 ||
        unusedOps.length > 0 ||
        noUiEvidence.length > 0 ||
        noBackendEvidence.length > 0;

      if (!hasIssues) {
        out += "All integration checks passed.";
        return out.trim();
      }

      return { output: out.trim(), metadata: { error: true } };
    } catch (error: any) {
      return { output: `Error validating integration: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaIntegrationValidate;