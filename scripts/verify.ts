import { mkdtemp, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import plugin from "../dist/index.js";

type ToolCtx = {
  worktree: string;
  directory: string;
  sessionID: string;
  messageID: string;
  agent: string;
  abort: AbortSignal;
  metadata: (input: { title?: string; metadata?: Record<string, any> }) => void;
  ask: (input: any) => any;
};

function createToolCtx(root: string): ToolCtx {
  return {
    worktree: root,
    directory: root,
    sessionID: "verify-session",
    messageID: "verify-message",
    agent: "verify-agent",
    abort: new AbortController().signal,
    metadata: () => {},
    ask: () => undefined,
  };
}

async function main() {
  const root = await mkdtemp(join(tmpdir(), "narukana-verify-"));

  const hooks = await plugin.server(
    {
      client: undefined as any,
      project: undefined as any,
      directory: root,
      worktree: root,
      experimental_workspace: { register: () => {} },
      serverUrl: new URL("http://localhost"),
      $: undefined as any,
    },
    {},
  );

  if (!hooks.tool) throw new Error("Tool map not found");

  const t = hooks.tool;
  const ctx = createToolCtx(root);

  await t.narukana_init.execute({}, ctx);
  await t.narukana_plan_create.execute({ regenerate: true }, ctx);
  await t.narukana_execute_task.execute({ action: "next", name: "verify-agent" }, ctx);

  const required = [
    ".narukana/narukana.json",
    ".narukana/context/context.md",
    ".narukana/specs/ui.md",
    ".narukana/specs/contract.json",
    ".narukana/specs/contract-detail.md",
    ".narukana/specs/integration.md",
    ".narukana/plan.md",
    ".narukana/tasks.json",
    ".narukana/memory.md",
  ];

  for (const p of required) {
    if (!existsSync(join(root, p))) {
      throw new Error(`Missing required output: ${p}`);
    }
  }

  const tasks = JSON.parse(await readFile(join(root, ".narukana", "tasks.json"), "utf-8"));
  if (!tasks.meta?.planId) throw new Error("tasks.json missing meta.planId");

  const memoryRaw = await readFile(join(root, ".narukana", "memory.md"), "utf-8");
  if (!memoryRaw.includes("planId:")) throw new Error("memory.md missing planId metadata");

  console.log(`VERIFY_OK ${root}`);
}

main().catch((error) => {
  console.error("VERIFY_FAIL", error);
  process.exit(1);
});
