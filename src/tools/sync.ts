import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { getNarukanaFs } from "../core/narukanaFs";

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

      return out;
    } catch (error: any) {
      return { output: `Error syncing workspace: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaSync;
