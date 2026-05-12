export declare const narukanaPlanCreate: {
    description: string;
    args: {
        regenerate: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodBoolean>>;
        instruction: import("zod").ZodOptional<import("zod").ZodString>;
    };
    execute(args: {
        regenerate: boolean;
        instruction?: string | undefined;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<import("@opencode-ai/plugin").ToolResult>;
};
export default narukanaPlanCreate;
//# sourceMappingURL=planCreate.d.ts.map