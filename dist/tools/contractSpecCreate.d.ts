export declare const narukanaContractSpecCreate: {
    description: string;
    args: {
        regenerate: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodBoolean>>;
    };
    execute(args: {
        regenerate: boolean;
    }, context: import("@opencode-ai/plugin").ToolContext): Promise<import("@opencode-ai/plugin").ToolResult>;
};
export default narukanaContractSpecCreate;
//# sourceMappingURL=contractSpecCreate.d.ts.map