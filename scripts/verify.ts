import { mkdir, rm, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";

import plugin from "../dist/index.js";

type FsLike = {
  stat(path: string): Promise<any>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  mkdir(path: string, opts: any): Promise<void>;
  glob(pattern: string, opts: { cwd: string }): Promise<string[]>;
};

function makeFs(baseDir: string): FsLike {
  const toAbs = (p: string) => (resolve(p) === p ? p : join(baseDir, p));

  return {
    stat: async (p: string) => {
      return await Bun.file(toAbs(p)).stat();
    },
    readFile: async (p: string) => {
      return await Bun.file(toAbs(p)).text();
    },
    writeFile: async (p: string, content: string) => {
      await Bun.write(toAbs(p), content);
    },
    mkdir: async (p: string, opts: any) => {
      await mkdir(toAbs(p), { recursive: true, ...opts });
    },
    glob: async (pattern: string, opts: { cwd: string }) => {
      const cwdAbs = toAbs(opts.cwd);
      const g = new Bun.Glob(pattern);
      const results: string[] = [];
      for await (const file of g.scan({ cwd: cwdAbs, onlyFiles: true })) {
        results.push(join(cwdAbs, file));
      }
      return results;
    },
  };
}

async function runTool(name: string, args: any, baseDir: string) {
  const toolDef = (plugin as any).tools.find((t: any) => t.description && t.execute && t.args);
  // Plugin tools are exported as ToolDefinition objects; in dist/index.js we exported them in array.
  const toolObj = (plugin as any).toolsMap?.[name] ?? (plugin as any).tools.find((t: any) => t?.execute && t?.description && (t as any).name === name);
  // Our plugin currently exports ToolDefinitions without explicit name; rely on order mapping below.
  throw new Error("Tool lookup not implemented - update verify script to map tool names.");
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseDir = join(process.cwd(), `.verify-${stamp}`);

  if (existsSync(baseDir)) {
    await rm(baseDir, { recursive: true, force: true });
  }
  await mkdir(baseDir, { recursive: true });

  const fs = makeFs(baseDir);
  const ctx = { fs };

  // Tools are in plugin.tools array in fixed order (see src/index.ts)
  const tools = (plugin as any).tools;
  const [
    narukana_init,
    narukana_context_create,
    narukana_ui_spec_create,
    narukana_contract_spec_create,
    narukana_integration_spec_create,
    narukana_plan_create,
    narukana_execute_task,
    narukana_sync,
    narukana_ui_spec_validate,
    narukana_contract_spec_validate,
    narukana_integration_spec_validate,
  ] = tools;

  // 1) init
  await narukana_init.execute({}, ctx);

  const requiredPaths = [
    ".narukana/narukana.json",
    ".narukana/context/context.md",
    ".narukana/specs/ui.md",
    ".narukana/specs/contract.json",
    ".narukana/specs/contract-detail.md",
    ".narukana/specs/integration.md",
  ];

  for (const p of requiredPaths) {
    const ok = existsSync(join(baseDir, p));
    if (!ok) throw new Error(`Missing after init: ${p}`);
  }

  // 2) plan
  await narukana_plan_create.execute({ regenerate: true }, ctx);
  const planPath = join(baseDir, ".narukana/plan.md");
  if (!existsSync(planPath)) throw new Error("plan.md not created");
  const plan = await readFile(planPath, "utf-8");
  if (!plan.includes("### T-001:")) throw new Error("plan.md missing task headers");

  // 3) execute_task next
  await narukana_execute_task.execute({ action: "next", name: "verify" }, ctx);
  const tasksPath = join(baseDir, ".narukana/tasks.json");
  if (!existsSync(tasksPath)) throw new Error("tasks.json not created");
  const tasks = JSON.parse(await readFile(tasksPath, "utf-8"));
  if (!tasks.planId) throw new Error("tasks.json missing planId");
  const inProgress = tasks.tasks.filter((t: any) => t.state.status === "in_progress");
  if (inProgress.length !== 1) throw new Error("Expected exactly 1 in_progress task after next");

  // 4) validators (should not throw)
  await narukana_ui_spec_validate.execute({}, ctx);
  await narukana_contract_spec_validate.execute({}, ctx);
  await narukana_integration_spec_validate.execute({}, ctx);
  await narukana_sync.execute({}, ctx);

  console.log("VERIFY_OK");
}

main().catch((e) => {
  console.error("VERIFY_FAIL", e);
  process.exit(1);
});
