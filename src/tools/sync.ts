import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";
import { parsePlanId } from "../core/planFormat";
import { parseMemory } from "../core/memoryFormat";

export const narukanaSync = tool({
  description: "Verify presence of required files up to plan (read-only, no file writes)",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);

    try {
      const required = [
        { path: paths.context(), name: "context.md" },
        { path: paths.uiSpec(), name: "ui.md" },
        { path: paths.contractJson(), name: "contract.json" },
        { path: paths.integration(), name: "integration.md" },
        { path: paths.plan(), name: "plan.md" },
      ];

      const present: string[] = [];
      const missing: string[] = [];
      for (const f of required) {
        if (await fileExists(fs, f.path)) present.push(f.name);
        else missing.push(f.name);
      }

      let out = `Narukana Sync\n\n`;
      out += `Present:\n${present.map((p) => `- ${p}`).join("\n") || "(none)"}\n\n`;
      out += `Missing:\n${missing.map((m) => `- ${m}`).join("\n") || "(none)"}`;

      if (missing.length === 0) {
        out += "\n\nRecommended validators:\n";
        out += "- narukana_ui_spec_validate\n";
        out += "- narukana_contract_spec_validate\n";
        out += "- narukana_integration_spec_validate\n";
        out += "- narukana_ui_validate\n";
        out += "- narukana_contract_validate\n";
        out += "- narukana_integration_validate\n";
      }

      const hasMemory = await fileExists(fs, paths.memory());
      out += `\nMemory:\n- Present: ${hasMemory ? "yes" : "no"}`;

      if (hasMemory) {
        try {
          const memory = parseMemory(await fs.readFile(paths.memory()));
          if (await fileExists(fs, paths.plan())) {
            const planId = parsePlanId(await fs.readFile(paths.plan()));
            const status = memory.metadata.planId === planId ? "in sync" : "stale";
            out += `\n- Status: ${status}\n- Memory planId: ${memory.metadata.planId}\n- Current planId: ${planId}`;
          } else {
            out += `\n- Status: unknown (plan.md missing)\n- Memory planId: ${memory.metadata.planId}`;
          }
        } catch (error: any) {
          out += `\n- Status: invalid (${error.message})`;
        }
      }

      return out;
    } catch (error: any) {
      return { output: `Error syncing workspace: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaSync;
