import { TASK_ID_PREFIX, TASK_ID_WIDTH } from "./constants";
import { computePlanId } from "./hashing";
export function generateTaskId(index) {
    const numStr = String(index).padStart(TASK_ID_WIDTH, "0");
    return `${TASK_ID_PREFIX}${numStr}`;
}
export function parsePlanId(planContent) {
    return computePlanId(planContent);
}
export function createEmptyTasksLedger(planId) {
    return {
        planId,
        planGeneratedAt: new Date().toISOString(),
        tasks: [],
    };
}
export function createTask(definition) {
    return {
        definition,
        state: {
            status: "todo",
        },
    };
}
export function parseTasksFromPlan(planContent) {
    const tasks = [];
    const lines = planContent.split("\n");
    let currentTask = null;
    let currentSection = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const taskMatch = line.match(/^###\s+(T-\d+):\s+(.+)$/);
        if (taskMatch) {
            if (currentTask && currentTask.id) {
                tasks.push(currentTask);
            }
            currentTask = {
                id: taskMatch[1],
                title: taskMatch[2],
                dependsOn: [],
                specRefs: [],
                riskTags: [],
                acceptance: [],
                verification: [],
            };
            currentSection = null;
            continue;
        }
        if (currentTask) {
            const depMatch = line.match(/^DependsOn:\s*(.*)$/);
            if (depMatch) {
                const deps = depMatch[1].trim();
                currentTask.dependsOn = deps ? deps.split(",").map((d) => d.trim()) : [];
                continue;
            }
            const specMatch = line.match(/^SpecRefs:\s*(.*)$/);
            if (specMatch) {
                const refs = specMatch[1].trim();
                currentTask.specRefs = refs ? refs.split(",").map((r) => r.trim()) : [];
                continue;
            }
            const riskMatch = line.match(/^RiskTags:\s*(.*)$/);
            if (riskMatch) {
                const risks = riskMatch[1].trim();
                currentTask.riskTags = risks ? risks.split(",").map((r) => r.trim()) : [];
                continue;
            }
            if (line === "Acceptance:") {
                currentSection = "acceptance";
                continue;
            }
            if (line === "Verification:") {
                currentSection = "verification";
                continue;
            }
            const itemMatch = line.match(/^-\s+(.+)$/);
            if (itemMatch && currentSection && currentTask) {
                const item = itemMatch[1];
                if (currentSection === "acceptance") {
                    currentTask.acceptance = currentTask.acceptance || [];
                    currentTask.acceptance.push(item);
                }
                else if (currentSection === "verification") {
                    currentTask.verification = currentTask.verification || [];
                    currentTask.verification.push(item);
                }
            }
        }
    }
    if (currentTask && currentTask.id) {
        tasks.push(currentTask);
    }
    return tasks;
}
//# sourceMappingURL=planFormat.js.map