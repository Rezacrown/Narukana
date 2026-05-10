export declare const narukanaContextCreate: {
    description: string;
    args: {
        regenerate: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodBoolean>>;
        include: import("zod").ZodOptional<import("zod").ZodString>;
    };
    execute(args: {
        regenerate: boolean;
        include?: string | undefined;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<import("@opencode-ai/plugin").ToolResult>;
};
export default narukanaContextCreate;
//# sourceMappingURL=contextCreate.d.ts.map