import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { NARUKANA_UI_ACTIONS_START, NARUKANA_UI_ACTIONS_END } from "../core/constants";
import {
  createEmptyTasksLedger,
  createTask,
  generateTaskId,
  parsePlanId,
  parseTasksFromPlan,
} from "../core/planFormat";
import { generateMemoryMarkdown } from "../core/memoryFormat";
import { getNarukanaFs } from "../core/narukanaFs";

interface UIAction {
  action: string;
}

interface ContractOperation {
  name: string;
  type: string;
  transport: string;
}

function parseUIActions(content: string): UIAction[] {
  const actions: UIAction[] = [];
  const startIdx = content.indexOf(NARUKANA_UI_ACTIONS_START);
  const endIdx = content.indexOf(NARUKANA_UI_ACTIONS_END);

  if (startIdx === -1 || endIdx === -1) return actions;

  const block = content.substring(
    startIdx + NARUKANA_UI_ACTIONS_START.length,
    endIdx,
  );

  for (const line of block.split("\n")) {
    const match = line.trim().match(/^- action:\s*(.+)$/);
    if (match) actions.push({ action: match[1].trim() });
  }

  return actions;
}

function parseContractOperations(content: string): ContractOperation[] {
  const operations: ContractOperation[] = [];
  const data = JSON.parse(content);
  if (data.operations && typeof data.operations === "object") {
    for (const [name, op] of Object.entries<any>(data.operations)) {
      operations.push({
        name,
        type: op.type || "query",
        transport: op.transport || "http",
      });
    }
  }
  return operations;
}

function generatePlan(uiActions: UIAction[], contractOps: ContractOperation[]): string {
  let plan = `# Plan\n\n> Generated at: ${new Date().toISOString()}\n> This plan is derived from specs - do not edit manually\n\n`;

  let taskIndex = 1;
  const uiTaskIds: string[] = [];
  const contractTaskIds: string[] = [];

  for (const action of uiActions) {
    const id = generateTaskId(taskIndex++);
    uiTaskIds.push(id);
    plan += `### ${id}: Implement UI for "${action.action}"\n\nDependsOn: \nSpecRefs: ui.md\nRiskTags: \n\nAcceptance:\n- UI component for "${action.action}" exists\n- Component handles loading, error, and success states\n\nVerification:\n- Component renders correctly\n- States are properly displayed\n\n`;
  }

  for (const op of contractOps) {
    const id = generateTaskId(taskIndex++);
    contractTaskIds.push(id);
    plan += `### ${id}: Implement ${op.transport} operation "${op.name}"\n\nDependsOn: \nSpecRefs: contract.json, contract-detail.md\nRiskTags: \n\nAcceptance:\n- Operation "${op.name}" is implemented\n- Input validation is in place\n- Error handling is implemented\n\nVerification:\n- Operation responds correctly to valid input\n- Errors are handled appropriately\n\n`;
  }

  // Final integration task MUST depend on all previous tasks
  const allDeps = [...uiTaskIds, ...contractTaskIds];
  const integrationId = generateTaskId(taskIndex++);
  plan += `### ${integrationId}: Integration testing\n\nDependsOn: ${allDeps.join(", ")}\nSpecRefs: integration.md\nRiskTags: \n\nAcceptance:\n- All UI actions are wired to their operations\n- Error flows work correctly\n\nVerification:\n- End-to-end flow testing passes\n\n`;

  return plan;
}

export const narukanaPlanCreate = tool({
  description: "Generate plan.md from specs (context, ui, contract, integration)",
  args: {
    regenerate: tool.schema.boolean().optional().default(true),
  },
  execute: async (args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    const regenerate = args.regenerate ?? true;

    try {
      const required = [paths.context(), paths.uiSpec(), paths.contractJson(), paths.integration()];
      const missing: string[] = [];
      for (const p of required) {
        if (!(await fileExists(fs, p))) missing.push(p);
      }
      if (missing.length > 0) {
        return {
          output: `Cannot generate plan. Missing required files:\n${missing.map((m) => `- ${m}`).join("\n")}`,
          metadata: { error: true },
        };
      }

      const exists = await fileExists(fs, paths.plan());
      if (exists && !regenerate) {
        return { output: ".narukana/plan.md already exists. Use regenerate:true to overwrite.", metadata: { error: true } };
      }

      if (exists && regenerate) {
        const backupPath = createBackupPath(paths.plan());
        await fs.writeFile(backupPath, await fs.readFile(paths.plan()));
      }

      const uiContent = await fs.readFile(paths.uiSpec());
      const contractContent = await fs.readFile(paths.contractJson());
      const uiActions = parseUIActions(uiContent);
      const contractOps = parseContractOperations(contractContent);

      const planContent = generatePlan(uiActions, contractOps);
      await fs.writeFile(paths.plan(), planContent);

      const planId = parsePlanId(planContent);
      const taskDefinitions = parseTasksFromPlan(planContent);
      const ledger = createEmptyTasksLedger(planId);
      for (const taskDef of taskDefinitions) ledger.tasks.push(createTask(taskDef));

      const memoryContent = generateMemoryMarkdown({
        planContent,
        contextContent: await fs.readFile(paths.context()),
        uiSpecContent: uiContent,
        contractContent,
        integrationContent: await fs.readFile(paths.integration()),
        ledger,
        planId,
      });
      await fs.writeFile(paths.memory(), memoryContent);

      return `Generated .narukana/plan.md (planId: ${planId}) and .narukana/memory.md\n\nTasks generated:\n- UI tasks: ${uiActions.length}\n- Contract tasks: ${contractOps.length}\n- Integration task: 1`;
    } catch (error: any) {
      return { output: `Error generating plan: ${error.message}`, metadata: { error: true } };
    }
  },
});

export default narukanaPlanCreate;
