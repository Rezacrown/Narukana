import { tool } from "@opencode-ai/plugin";
import { paths, fileExists } from "../core/fileSystem";
import { DEFAULT_LEASE_MINUTES } from "../core/constants";
import { parseTasksFromPlan, parsePlanId, createEmptyTasksLedger, createTask, } from "../core/planFormat";
import { getNarukanaFs } from "../core/narukanaFs";
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
export const narukanaExecuteTask = tool({
    description: "Execute task actions: next, report, status, release",
    args: {
        action: tool.schema.enum(["next", "report", "status", "release"]),
        name: tool.schema.string().optional().default("agent"),
        leaseMinutes: tool.schema.number().optional().default(DEFAULT_LEASE_MINUTES),
        taskId: tool.schema.string().optional(),
        status: tool.schema.enum(["in_progress", "done", "failed", "blocked", "skipped"]).optional(),
        fatalReason: tool.schema.string().optional(),
        evidence: tool.schema.string().optional(),
    },
    execute: async (args, ctx) => {
        const fs = getNarukanaFs(ctx.worktree);
        const action = args.action;
        const name = args.name ?? "agent";
        const leaseMinutes = args.leaseMinutes ?? DEFAULT_LEASE_MINUTES;
        try {
            if (!(await fileExists(fs, paths.plan()))) {
                return { output: "No plan found at .narukana/plan.md. Run narukana_plan_create first.", metadata: { error: true } };
            }
            const planContent = await fs.readFile(paths.plan());
            const planId = parsePlanId(planContent);
            let ledger;
            if (await fileExists(fs, paths.tasks())) {
                ledger = JSON.parse(await fs.readFile(paths.tasks()));
                if (ledger.planId !== planId)
                    ledger = initializeTasksFromPlan(planContent);
            }
            else {
                ledger = initializeTasksFromPlan(planContent);
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
                return `Claimed task ${eligible.definition.id}: ${eligible.definition.title}`;
            }
            if (action === "status") {
                const counts = (status) => ledger.tasks.filter((t) => t.state.status === status).length;
                return `Task Status (planId: ${planId}):\n\n- Todo: ${counts("todo")}\n- In Progress: ${counts("in_progress")}\n- Done: ${counts("done")}\n- Failed: ${counts("failed")}\n- Blocked: ${counts("blocked")}\n- Total: ${ledger.tasks.length}`;
            }
            if (action === "report") {
                const taskId = args.taskId;
                const status = args.status;
                if (!taskId || !status) {
                    return { output: "report requires taskId and status", metadata: { error: true } };
                }
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
                return `Task ${taskId} status updated to: ${status}`;
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
                return `Task ${taskId} released`;
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