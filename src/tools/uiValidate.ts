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

  const actionsBlock = content.substring(
    startIdx + NARUKANA_UI_ACTIONS_START.length,
    endIdx,
  );

  for (const line of actionsBlock.split("\n")) {
    const match = line.trim().match(/^- action:\s*(.+)$/);
    if (match) actions.push(match[1].trim());
  }
  return actions;
}

async function hasEvidence(fs: any, rootPath: string, action: string): Promise<boolean> {
  const files = await fs.glob("**/*.{ts,tsx,js,jsx}", { cwd: rootPath });
  const searchTerms = [
    action.toLowerCase().replace(/\s+/g, ""),
    action.toLowerCase().replace(/\s+/g, "_"),
    action.toLowerCase(),
  ];

  for (const file of files) {
    try {
      const content = await fs.readFile(file);
      for (const term of searchTerms) {
        if (content.toLowerCase().includes(term)) return true;
      }
    } catch {
      // ignore read errors
    }
  }

  return false;
}

export const narukanaUiValidate = tool({
  description: "Deep-scan: validate UI action implementation evidence exists (read-only)",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);

    try {
      if (!(await fileExists(fs, paths.narukanaJson()))) {
        return { output: "Config not found at .narukana/narukana.json", metadata: { error: true } };
      }
      if (!(await fileExists(fs, paths.uiSpec()))) {
        return { output: "UI spec not found at .narukana/specs/ui.md", metadata: { error: true } };
      }

      const config = JSON.parse(await fs.readFile(paths.narukanaJson()));
      if (!isValidConfig(config)) {
        return { output: "Invalid narukana.json config", metadata: { error: true } };
      }
      if (!config.paths.uiRoot) {
        return { output: "uiRoot not configured in narukana.json", metadata: { error: true } };
      }

      const uiRoot = config.paths.uiRoot;
      // uiRoot is user-provided; treat as relative to worktree
      if (!(await fileExists(fs, uiRoot))) {
        return { output: `uiRoot path does not exist: ${uiRoot}`, metadata: { error: true } };
      }

      const actions = parseUIActions(await fs.readFile(paths.uiSpec()));
      if (actions.length === 0) return "No UI actions defined in ui.md";

      let out = "Deep-scan validation for UI actions:\n\n";
      for (const action of actions) {
        const ok = await hasEvidence(fs, uiRoot, action);
        out += `- ${action}: ${ok ? "FOUND" : "NOT FOUND"}\n`;
      }
      return out.trim();
    } catch (error: any) {
      return { output: `Error validating UI: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaUiValidate;
