import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { DEFAULT_LEASE_MINUTES } from "../core/constants";
import { parseTasksFromPlan, parsePlanId, createEmptyTasksLedger, createTask, parseTasksLedger, } from "../core/planFormat";
import { getNarukanaFs } from "../core/narukanaFs";
import { generateMemoryMarkdown, parseMemory } from "../core/memoryFormat";
function findEligibleTasks(tasks) {
    for (const task of tasks) {
        if (task.state.status !== "todo")
            continue;
        const deps = task.definition.dependsOn;
        if (deps.length === 0)
            return task;
        const allDepsDone = deps.every((depId) => {
            const depTask = tasks.find((t) => t.definition.id === depId);
            return depTask && (depTask.state.status === "done" || depTask.state.status === "skipped");
        });
        if (allDepsDone)
            return task;
    }
    return null;
}
function markDependentsBlocked(tasks, failedTaskId) {
    for (const task of tasks) {
        if (task.definition.dependsOn.includes(failedTaskId) && task.state.status === "todo") {
            task.state.status = "blocked";
        }
    }
}
function initializeTasksFromPlan(planContent) {
    const taskDefs = parseTasksFromPlan(planContent);
    const planId = parsePlanId(planContent);
    const ledger = createEmptyTasksLedger(planId);
    for (const def of taskDefs)
        ledger.tasks.push(createTask(def));
    return ledger;
}
async function refreshMemory(fs, planContent, ledger, planId) {
    const memoryContent = generateMemoryMarkdown({
        planContent,
        contextContent: await fs.readFile(paths.context()),
        uiSpecContent: await fs.readFile(paths.uiSpec()),
        contractContent: await fs.readFile(paths.contractJson()),
        integrationContent: await fs.readFile(paths.integration()),
        ledger,
        planId,
    });
    await fs.writeFile(paths.memory(), memoryContent);
}
function validateActionArgs(args) {
    if ((args.action === "next" || args.action === "report" || args.action === "release") && !args.name) {
        return `action \"${args.action}\" requires \"name\"`;
    }
    if (args.action === "report") {
        if (!args.taskId)
            return 'action "report" requires "taskId"';
        if (!args.status)
            return 'action "report" requires "status"';
        if (!["in_progress", "done", "failed", "blocked"].includes(args.status)) {
            return 'action "report" allows status only: in_progress | done | failed | blocked';
        }
    }
    if (args.action === "release" && !args.taskId) {
        return 'action "release" requires "taskId"';
    }
    return null;
}
export const narukanaExecuteTask = tool({
    description: "Execute task actions: next, report, status, release",
    args: {
        action: tool.schema.enum(["next", "report", "status", "release"]),
        name: tool.schema.string().optional(),
        leaseMinutes: tool.schema.number().optional().default(DEFAULT_LEASE_MINUTES),
        taskId: tool.schema.string().optional(),
        status: tool.schema.enum(["in_progress", "done", "failed", "blocked"]).optional(),
        fatalReason: tool.schema.string().optional(),
        evidence: tool.schema.string().optional(),
    },
    execute: async (args, ctx) => {
        const fs = getNarukanaFs(ctx.worktree);
        const action = args.action;
        const name = args.name;
        const leaseMinutes = args.leaseMinutes ?? DEFAULT_LEASE_MINUTES;
        try {
            const argError = validateActionArgs(args);
            if (argError)
                return { output: argError, metadata: { error: true } };
            if (!(await fileExists(fs, paths.plan()))) {
                return { output: "No plan found at .narukana/plan.md. Run narukana_plan_create first.", metadata: { error: true } };
            }
            const planContent = await fs.readFile(paths.plan());
            const planId = parsePlanId(planContent);
            let ledger;
            if (await fileExists(fs, paths.tasks())) {
                ledger = parseTasksLedger(await fs.readFile(paths.tasks()));
                if (ledger.meta.planId !== planId)
                    ledger = initializeTasksFromPlan(planContent);
            }
            else {
                ledger = initializeTasksFromPlan(planContent);
            }
            let memoryStatus = "fresh";
            if (await fileExists(fs, paths.memory())) {
                const memoryRaw = await fs.readFile(paths.memory());
                try {
                    const parsedMemory = parseMemory(memoryRaw);
                    if (parsedMemory.metadata.planId !== planId) {
                        await refreshMemory(fs, planContent, ledger, planId);
                        memoryStatus = "refreshed";
                    }
                }
                catch {
                    await refreshMemory(fs, planContent, ledger, planId);
                    memoryStatus = "refreshed";
                }
            }
            else {
                await refreshMemory(fs, planContent, ledger, planId);
                memoryStatus = "refreshed";
            }
            if (action === "next") {
                const eligible = findEligibleTasks(ledger.tasks);
                if (!eligible)
                    return "No eligible tasks found.";
                const now = Date.now();
                eligible.state.status = "in_progress";
                eligible.state.claimedAt = now;
                eligible.state.leaseEndsAt = now + leaseMinutes * 60 * 1000;
                eligible.state.claimedBy = name;
                await fs.writeFile(paths.tasks(), JSON.stringify(ledger, null, 2));
                await refreshMemory(fs, planContent, ledger, planId);
                memoryStatus = "refreshed";
                const specRefs = eligible.definition.specRefs.join(", ") || "(none)";
                return `Claimed task ${eligible.definition.id}: ${eligible.definition.title}\nSpec refs: ${specRefs}\nMemory: ${memoryStatus}`;
            }
            if (action === "status") {
                const counts = (status) => ledger.tasks.filter((t) => t.state.status === status).length;
                return `Task Status (planId: ${planId}):\n\n- Todo: ${counts("todo")}\n- In Progress: ${counts("in_progress")}\n- Done: ${counts("done")}\n- Failed: ${counts("failed")}\n- Blocked: ${counts("blocked")}\n- Total: ${ledger.tasks.length}\n- Memory: ${memoryStatus}`;
            }
            if (action === "report") {
                const taskId = args.taskId;
                const status = args.status;
                const task = ledger.tasks.find((t) => t.definition.id === taskId);
                if (!task)
                    return { output: `Task ${taskId} not found`, metadata: { error: true } };
                task.state.status = status;
                task.state.completedAt = Date.now();
                if (status === "done" && args.evidence)
                    task.state.evidence = args.evidence;
                if (status === "failed" && args.fatalReason) {
                    task.state.fatalReason = args.fatalReason;
                    markDependentsBlocked(ledger.tasks, taskId);
                }
                await fs.writeFile(paths.tasks(), JSON.stringify(ledger, null, 2));
                await refreshMemory(fs, planContent, ledger, planId);
                return `Task ${taskId} status updated to: ${status}\nMemory: refreshed`;
            }
            if (action === "release") {
                const taskId = args.taskId;
                if (!taskId)
                    return { output: "release requires taskId", metadata: { error: true } };
                const task = ledger.tasks.find((t) => t.definition.id === taskId);
                if (!task)
                    return { output: `Task ${taskId} not found`, metadata: { error: true } };
                if (task.state.status !== "in_progress")
                    return { output: `Task ${taskId} is not in progress`, metadata: { error: true } };
                task.state.status = "todo";
                task.state.claimedAt = undefined;
                task.state.leaseEndsAt = undefined;
                task.state.claimedBy = undefined;
                await fs.writeFile(paths.tasks(), JSON.stringify(ledger, null, 2));
                await refreshMemory(fs, planContent, ledger, planId);
                return `Task ${taskId} released\nMemory: refreshed`;
            }
            return { output: `Unknown action: ${action}`, metadata: { error: true } };
        }
        catch (error) {
            return { output: `Error executing task action: ${error.message}`, metadata: { error: true } };
        }
    },
});
export default narukanaExecuteTask;
//# sourceMappingURL=executeTask.js.map