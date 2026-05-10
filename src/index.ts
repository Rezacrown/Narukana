import { tool } from "@opencode-ai/plugin";

import narukanaInit from "./tools/init";
import narukanaContextCreate from "./tools/contextCreate";
import narukanaUiSpecCreate from "./tools/uiSpecCreate";
import narukanaContractSpecCreate from "./tools/contractSpecCreate";
import narukanaIntegrationSpecCreate from "./tools/integrationSpecCreate";
import narukanaPlanCreate from "./tools/planCreate";
import narukanaExecuteTask from "./tools/executeTask";
import narukanaSync from "./tools/sync";
import narukanaUiSpecValidate from "./tools/uiSpecValidate";
import narukanaContractSpecValidate from "./tools/contractSpecValidate";
import narukanaIntegrationSpecValidate from "./tools/integrationSpecValidate";
import narukanaUiValidate from "./tools/uiValidate";
import narukanaContractValidate from "./tools/contractValidate";
import narukanaIntegrationValidate from "./tools/integrationValidate";

import type { PluginModule } from "@opencode-ai/plugin";

const NarukanaPlugin: PluginModule = {
  server: async (_input, _options) => {
    // Tools are exposed via Hooks.tool map
    return {
      tool: {
        narukana_init: narukanaInit,
        narukana_context_create: narukanaContextCreate,
        narukana_ui_spec_create: narukanaUiSpecCreate,
        narukana_contract_spec_create: narukanaContractSpecCreate,
        narukana_integration_spec_create: narukanaIntegrationSpecCreate,
        narukana_plan_create: narukanaPlanCreate,
        narukana_execute_task: narukanaExecuteTask,
        narukana_sync: narukanaSync,
        narukana_ui_spec_validate: narukanaUiSpecValidate,
        narukana_contract_spec_validate: narukanaContractSpecValidate,
        narukana_integration_spec_validate: narukanaIntegrationSpecValidate,
        narukana_ui_validate: narukanaUiValidate,
        narukana_contract_validate: narukanaContractValidate,
        narukana_integration_validate: narukanaIntegrationValidate,
      },
    };
  },
};

export default NarukanaPlugin;
