export declare const narukanaExecuteTask: {
    description: string;
    args: {
        action: import("zod").ZodEnum<{
            next: "next";
            report: "report";
            status: "status";
            release: "release";
        }>;
        name: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodString>>;
        leaseMinutes: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodNumber>>;
        taskId: import("zod").ZodOptional<import("zod").ZodString>;
        status: import("zod").ZodOptional<import("zod").ZodEnum<{
            in_progress: "in_progress";
            done: "done";
            failed: "failed";
            blocked: "blocked";
            skipped: "skipped";
        }>>;
        fatalReason: import("zod").ZodOptional<import("zod").ZodString>;
        evidence: import("zod").ZodOptional<import("zod").ZodString>;
    };
    execute(args: {
        action: "next" | "report" | "status" | "release";
        name: string;
        leaseMinutes: number;
        taskId?: string | undefined;
        status?: "in_progress" | "done" | "failed" | "blocked" | "skipped" | undefined;
        fatalReason?: string | undefined;
        evidence?: string | undefined;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<import("@opencode-ai/plugin").ToolResult>;
};
export default narukanaExecuteTask;
//# sourceMappingURL=executeTask.d.ts.map