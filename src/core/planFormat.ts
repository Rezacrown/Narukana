import { TASK_ID_PREFIX, TASK_ID_WIDTH } from "./constants";
import { computePlanId } from "./hashing";

export interface TaskDefinition {
  id: string;
  title: string;
  dependsOn: string[];
  specRefs: string[];
  riskTags: string[];
  acceptance: string[];
  verification: string[];
}

export interface TaskState {
  status: "todo" | "in_progress" | "done" | "failed" | "blocked" | "skipped";
  claimedAt?: number;
  leaseEndsAt?: number;
  claimedBy?: string;
  completedAt?: number;
  fatalReason?: string;
  evidence?: string;
  report?: string;
}

export interface Task {
  definition: TaskDefinition;
  state: TaskState;
}

export interface TasksLedger {
  schemaVersion: 1;
  meta: {
    planId: string;
    planGeneratedAt: string;
  };
  tasks: Task[];
}

export function generateTaskId(index: number): string {
  const numStr = String(index).padStart(TASK_ID_WIDTH, "0");
  return `${TASK_ID_PREFIX}${numStr}`;
}

export function parsePlanId(planContent: string): string {
  return computePlanId(planContent);
}

export function createEmptyTasksLedger(planId: string): TasksLedger {
  return {
    schemaVersion: 1,
    meta: {
      planId,
      planGeneratedAt: new Date().toISOString(),
    },
    tasks: [],
  };
}

export function parseTasksLedger(raw: string): TasksLedger {
  const parsed = JSON.parse(raw);

  if (
    parsed &&
    parsed.schemaVersion === 1 &&
    parsed.meta &&
    typeof parsed.meta.planId === "string" &&
    typeof parsed.meta.planGeneratedAt === "string" &&
    Array.isArray(parsed.tasks)
  ) {
    return parsed as TasksLedger;
  }

  if (
    parsed &&
    typeof parsed.planId === "string" &&
    typeof parsed.planGeneratedAt === "string" &&
    Array.isArray(parsed.tasks)
  ) {
    return {
      schemaVersion: 1,
      meta: {
        planId: parsed.planId,
        planGeneratedAt: parsed.planGeneratedAt,
      },
      tasks: parsed.tasks,
    };
  }

  throw new Error("Invalid tasks.json schema. Expected v1 with meta.planId and tasks[].definition/state.");
}

export function createTask(definition: TaskDefinition): Task {
  return {
    definition,
    state: {
      status: "todo",
    },
  };
}

export function parseTasksFromPlan(planContent: string): TaskDefinition[] {
  const tasks: TaskDefinition[] = [];
  const lines = planContent.split("\n");

  let currentTask: Partial<TaskDefinition> | null = null;
  let currentSection: "acceptance" | "verification" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const taskMatch = line.match(/^###\s+(T-\d+):\s+(.+)$/);
    if (taskMatch) {
      if (currentTask && currentTask.id) {
        tasks.push(currentTask as TaskDefinition);
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
        } else if (currentSection === "verification") {
          currentTask.verification = currentTask.verification || [];
          currentTask.verification.push(item);
        }
      }
    }
  }

  if (currentTask && currentTask.id) {
    tasks.push(currentTask as TaskDefinition);
  }

  return tasks;
}
