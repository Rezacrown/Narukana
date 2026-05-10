export declare const narukanaPlanCreate: {
    description: string;
    args: {
        regenerate: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodBoolean>>;
    };
    execute(args: {
        regenerate: boolean;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<import("@opencode-ai/plugin").ToolResult>;
};
export default narukanaPlanCreate;
//# sourceMappingURL=planCreate.d.ts.map