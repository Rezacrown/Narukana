import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath } from "../core/fileSystem";
import { parseUIActions, parseContractOperations } from "../core/markdownParsers";
import { createEmptyTasksLedger, createTask, generateTaskId, parsePlanId, parseTasksFromPlan, } from "../core/planFormat";
import { generateMemoryMarkdown } from "../core/memoryFormat";
import { getNarukanaFs } from "../core/narukanaFs";
function generatePlan(uiActions, contractOps, instruction, contextGoal, contextNonGoals) {
    const generatedAt = new Date().toISOString();
    const directive = instruction || "Implement all specs as defined.";
    const goal = contextGoal || "Deliver the specified features.";
    const outOfScope = contextNonGoals || "Nothing explicitly excluded.";
    const inScopeItems = [
        ...uiActions.map((a) => `- UI: ${a.action}`),
        ...contractOps.map((o) => `- Operation: ${o.name} (${o.type}, ${o.transport})`),
        "- Integration testing across all layers",
    ].join("\n");
    let idx = 1;
    const uiIds = [];
    const contractIds = [];
    for (const _ of uiActions) {
        uiIds.push(generateTaskId(idx++));
    }
    for (const _ of contractOps) {
        contractIds.push(generateTaskId(idx++));
    }
    const integrationId = generateTaskId(idx++);
    const phasesBlock = [
        "### Phase 1: UI Foundation",
        ...(uiIds.length > 0 ? uiIds.map((id) => `- ${id}`) : ["- (no UI tasks)"]),
        "",
        "### Phase 2: Contract Foundation",
        ...(contractIds.length > 0 ? contractIds.map((id) => `- ${id}`) : ["- (no contract tasks)"]),
        "",
        "### Phase 3: Integration",
        `- ${integrationId}`,
    ].join("\n");
    let tasks = "";
    let taskIndex = 1;
    for (let i = 0; i < uiActions.length; i++) {
        const action = uiActions[i];
        const id = generateTaskId(taskIndex++);
        tasks += `### ${id}: Implement UI for "${action.action}"\n\nDependsOn: \nSpecRefs: ui.md\nRiskTags: \nPhase: 1\n\nAcceptance:\n- UI component for "${action.action}" exists\n- Component handles loading, error, and success states\n\nVerification:\n- Component renders correctly\n- States are properly displayed\n\n`;
    }
    for (const op of contractOps) {
        const id = generateTaskId(taskIndex++);
        const deps = uiIds.length > 0 ? uiIds.join(", ") : "";
        tasks += `### ${id}: Implement ${op.transport} operation "${op.name}"\n\nDependsOn: ${deps}\nSpecRefs: contract.json, contract-detail.md\nRiskTags: \nPhase: 2\n\nAcceptance:\n- Operation "${op.name}" is implemented\n- Input validation is in place\n- Error handling is implemented\n\nVerification:\n- Operation responds correctly to valid input\n- Errors are handled appropriately\n\n`;
    }
    {
        const id = generateTaskId(taskIndex++);
        const allDeps = [...uiIds, ...contractIds].join(", ");
        tasks += `### ${id}: Integration testing\n\nDependsOn: ${allDeps}\nSpecRefs: integration.md\nRiskTags: \nPhase: 3\n\nAcceptance:\n- All UI actions are wired to their operations\n- Error flows work correctly\n\nVerification:\n- End-to-end flow testing passes\n\n`;
    }
    return [
        "# Plan",
        "",
        `> Directive: ${directive}`,
        `> Generated at: ${generatedAt}`,
        `> This plan is derived from specs - do not edit manually`,
        "",
        "## Directive",
        directive,
        "",
        "## Goal",
        goal,
        "",
        "## Scope",
        "",
        "### In Scope",
        inScopeItems,
        "",
        "### Out of Scope",
        outOfScope,
        "",
        "## Phases",
        "",
        phasesBlock,
        "",
        "## Tasks",
        "",
        tasks,
    ].join("\n");
}
export const narukanaPlanCreate = tool({
    description: "Generate plan.md from specs (context, ui, contract, integration)",
    args: {
        regenerate: tool.schema.boolean().optional().default(false),
        instruction: tool.schema.string().optional(),
    },
    execute: async (args, ctx) => {
        const fs = getNarukanaFs(ctx.worktree);
        const regenerate = args.regenerate ?? false;
        const instruction = args.instruction || undefined;
        try {
            const required = [paths.context(), paths.uiSpec(), paths.contractJson(), paths.integration()];
            const missing = [];
            for (const p of required) {
                if (!(await fileExists(fs, p)))
                    missing.push(p);
            }
            if (missing.length > 0) {
                return {
                    output: `Cannot generate plan. Missing required files:\n${missing.map((m) => `- ${m}`).join("\n")}`,
                    metadata: { error: true },
                };
            }
            const planExists = await fileExists(fs, paths.plan());
            if (planExists && !regenerate) {
                return { output: ".narukana/plan.md already exists. Use regenerate:true to overwrite.", metadata: { error: true } };
            }
            if (planExists && regenerate) {
                const backupPath = createBackupPath(paths.plan());
                await fs.writeFile(backupPath, await fs.readFile(paths.plan()));
            }
            const memoryExists = await fileExists(fs, paths.memory());
            if (memoryExists && regenerate) {
                const memoryBackupPath = createBackupPath(paths.memory());
                await fs.writeFile(memoryBackupPath, await fs.readFile(paths.memory()));
            }
            const contextContent = await fs.readFile(paths.context());
            const uiContent = await fs.readFile(paths.uiSpec());
            const contractContent = await fs.readFile(paths.contractJson());
            const integrationContent = await fs.readFile(paths.integration());
            const uiActionNames = parseUIActions(uiContent);
            const contractOpKeys = parseContractOperations(contractContent);
            const uiActions = uiActionNames.map((a) => ({ action: a }));
            const contractOps = contractOpKeys.map((name) => {
                let type = "query";
                let transport = "http";
                try {
                    const json = JSON.parse(contractContent);
                    if (json.operations && json.operations[name]) {
                        type = json.operations[name].type || "query";
                        transport = json.operations[name].transport || "http";
                    }
                }
                catch { }
                return { name, type, transport };
            });
            const goalMatch = contextContent.match(/## Goal\n([\s\S]*?)(?:\n##|$)/);
            const contextGoal = goalMatch ? goalMatch[1].trim() : undefined;
            const nonGoalMatch = contextContent.match(/## Non-Goals\n([\s\S]*?)(?:\n##|$)/);
            const contextNonGoals = nonGoalMatch ? nonGoalMatch[1].trim() : undefined;
            const planContent = generatePlan(uiActions, contractOps, instruction, contextGoal, contextNonGoals);
            await fs.writeFile(paths.plan(), planContent);
            const planId = parsePlanId(planContent);
            const taskDefinitions = parseTasksFromPlan(planContent);
            const ledger = createEmptyTasksLedger(planId);
            for (const taskDef of taskDefinitions)
                ledger.tasks.push(createTask(taskDef));
            const memoryContent = generateMemoryMarkdown({
                planContent,
                contextContent,
                uiSpecContent: uiContent,
                contractContent,
                integrationContent,
                ledger,
                planId,
            });
            await fs.writeFile(paths.memory(), memoryContent);
            const overwrote = (planExists || memoryExists) && regenerate;
            return `Generated .narukana/plan.md (planId: ${planId}) and .narukana/memory.md\n\nTasks generated:\n- UI tasks: ${uiActions.length}\n- Contract tasks: ${contractOps.length}\n- Integration task: 1\n\n${overwrote ? "(Overwrote existing files - backups created)" : "(New files created)"}`;
        }
        catch (error) {
            return { output: `Error generating plan: ${error.message}`, metadata: { error: true } };
        }
    },
});
export default narukanaPlanCreate;
//# sourceMappingURL=planCreate.js.map