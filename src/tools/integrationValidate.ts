import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { isValidConfig } from "../core/config";
import {
  NARUKANA_UI_ACTIONS_START,
  NARUKANA_UI_ACTIONS_END,
} from "../core/constants";
import { getNarukanaFs } from "../core/narukanaFs";

function parseUIActions(content: string): string[] {
  const actions: string[] = [];
  const startIdx = content.indexOf(NARUKANA_UI_ACTIONS_START);
  const endIdx = content.indexOf(NARUKANA_UI_ACTIONS_END);
  if (startIdx === -1 || endIdx === -1) return actions;

  const block = content.substring(
    startIdx + NARUKANA_UI_ACTIONS_START.length,
    endIdx,
  );
  for (const line of block.split("\n")) {
    const match = line.trim().match(/^- action:\s*(.+)$/);
    if (match) actions.push(match[1].trim());
  }
  return actions;
}

function parseContractOperations(content: string): string[] {
  const data = JSON.parse(content);
  if (!data.operations || typeof data.operations !== "object") return [];
  return Object.keys(data.operations);
}

function parseIntegrationMappings(content: string): {
  actions: string[];
  operations: string[];
} {
  const result = { actions: [] as string[], operations: [] as string[] };

  const mappingsMatch = content.match(/## Mappings\n([\s\S]*?)(?:\n##|$)/);
  if (mappingsMatch) {
    const lines = mappingsMatch[1].split("\n");
    let currentAction = "";

    for (const line of lines) {
      const actionMatch = line.trim().match(/^- action:\s*(.+)$/);
      if (actionMatch) {
        currentAction = actionMatch[1].trim();
        if (!result.actions.includes(currentAction)) result.actions.push(currentAction);
      }

      const opMatch = line.trim().match(/^-\s+op:\s*(.+)$/);
      if (opMatch && currentAction) {
        const op = opMatch[1].trim();
        if (!result.operations.includes(op)) result.operations.push(op);
      }
    }
  }

  const opsMatch = content.match(/## Contract Operations\n([\s\S]*?)(?:\n##|$)/);
  if (opsMatch) {
    for (const line of opsMatch[1].split("\n")) {
      const match = line.trim().match(/^-\s+(.+)$/);
      if (match) {
        const op = match[1].trim();
        if (!result.operations.includes(op)) result.operations.push(op);
      }
    }
  }

  return result;
}

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

      for (const action of uiActions) {
        if (!integration.actions.includes(action)) unmappedActions.push(action);
      }
      for (const op of contractOps) {
        if (!integration.operations.includes(op)) unusedOps.push(op);
      }

      // Evidence checks for declared mappings
      for (const action of integration.actions) {
        const ok = await searchInDirectory(fs, config.paths.uiRoot, [
          action.toLowerCase(),
          action.toLowerCase().replace(/\s+/g, ""),
        ]);
        if (!ok) noUiEvidence.push(action);
      }

      for (const op of integration.operations) {
        if (op === "(none)" || op === "none") continue;
        const ok = await searchInDirectory(fs, config.paths.contractRoot, [op]);
        if (!ok) noBackendEvidence.push(op);
      }

      // Mappings section presence check
      if (!integrationMd.includes("## Mappings")) {
        missingMappingsInIntegration.push("## Mappings section is missing");
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
