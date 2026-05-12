export declare const narukanaExecuteTask: {
    description: string;
    args: {
        action: import("zod").ZodEnum<{
            next: "next";
            report: "report";
            status: "status";
            release: "release";
            assign: "assign";
        }>;
        name: import("zod").ZodOptional<import("zod").ZodString>;
        leaseMinutes: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodNumber>>;
        taskId: import("zod").ZodOptional<import("zod").ZodString>;
        status: import("zod").ZodOptional<import("zod").ZodEnum<{
            skipped: "skipped";
            in_progress: "in_progress";
            done: "done";
            failed: "failed";
            blocked: "blocked";
        }>>;
        fatalReason: import("zod").ZodOptional<import("zod").ZodString>;
        evidence: import("zod").ZodOptional<import("zod").ZodString>;
        instruction: import("zod").ZodOptional<import("zod").ZodString>;
    };
    execute(args: {
        action: "next" | "report" | "status" | "release" | "assign";
        leaseMinutes: number;
        name?: string | undefined;
        taskId?: string | undefined;
        status?: "skipped" | "in_progress" | "done" | "failed" | "blocked" | undefined;
        fatalReason?: string | undefined;
        evidence?: string | undefined;
        instruction?: string | undefined;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<import("@opencode-ai/plugin").ToolResult>;
};
export default narukanaExecuteTask;
//# sourceMappingURL=executeTask.d.ts.map