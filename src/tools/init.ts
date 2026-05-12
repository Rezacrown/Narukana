import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { createDefaultConfig } from "../core/config";
import { SCHEMA_VERSION } from "../core/constants";
import { getNarukanaFs } from "../core/narukanaFs";
import {
  CONTEXT_TEMPLATE,
  UI_SPEC_TEMPLATE,
  CONTRACT_JSON_TEMPLATE,
  CONTRACT_DETAIL_TEMPLATE,
  INTEGRATION_TEMPLATE,
} from "../core/templates";

export const narukanaInit = tool({
  description:
    "Initialize Narukana workspace with required directories and default template files",
  args: {},
  execute: async (_args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);

    try {
      await fs.mkdir(paths.contextDir(), { recursive: true });
      await fs.mkdir(paths.specsDir(), { recursive: true });

      if (!(await fileExists(fs, paths.narukanaJson()))) {
        const defaultConfig = createDefaultConfig();
        await fs.writeFile(
          paths.narukanaJson(),
          JSON.stringify(defaultConfig, null, 2),
        );
      }

      if (!(await fileExists(fs, paths.context()))) {
        await fs.writeFile(paths.context(), CONTEXT_TEMPLATE);
      }

      if (!(await fileExists(fs, paths.uiSpec()))) {
        await fs.writeFile(paths.uiSpec(), UI_SPEC_TEMPLATE);
      }

      if (!(await fileExists(fs, paths.contractJson()))) {
        const contractTemplate = { ...CONTRACT_JSON_TEMPLATE, schemaVersion: SCHEMA_VERSION };
        await fs.writeFile(
          paths.contractJson(),
          JSON.stringify(contractTemplate, null, 2),
        );
      }

      if (!(await fileExists(fs, paths.contractDetail()))) {
        await fs.writeFile(paths.contractDetail(), CONTRACT_DETAIL_TEMPLATE);
      }

      if (!(await fileExists(fs, paths.integration()))) {
        await fs.writeFile(paths.integration(), INTEGRATION_TEMPLATE);
      }

      return `Narukana workspace initialized/verified at .narukana/.\n\nEnsured:\n- .narukana/context/\n- .narukana/specs/\n\nDefault files (created if missing):\n- .narukana/narukana.json\n- .narukana/context/context.md\n- .narukana/specs/ui.md\n- .narukana/specs/contract.json\n- .narukana/specs/contract-detail.md\n- .narukana/specs/integration.md`;
    } catch (error: any) {
      return {
        output: `Error initializing Narukana workspace: ${error.message}`,
        metadata: { error: true },
      };
    }
  },
});

export default narukanaInit;