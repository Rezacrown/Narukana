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
    planId: string;
    planGeneratedAt: string;
    tasks: Task[];
}
export declare function generateTaskId(index: number): string;
export declare function parsePlanId(planContent: string): string;
export declare function createEmptyTasksLedger(planId: string): TasksLedger;
export declare function createTask(definition: TaskDefinition): Task;
export declare function parseTasksFromPlan(planContent: string): TaskDefinition[];
//# sourceMappingURL=planFormat.d.ts.map