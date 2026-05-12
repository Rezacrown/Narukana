import NarukanaPlugin from "../dist/index.js";

async function main() {
  // Minimal sanity: plugin exposes tool map
  const hooks = await (NarukanaPlugin as any).server(
    {
      client: null,
      project: null,
      directory: process.cwd(),
      worktree: process.cwd(),
      experimental_workspace: { register() {} },
      serverUrl: new URL("http://localhost"),
      $: null,
    },
    {},
  );

  if (!hooks.tool) throw new Error("No tool map found");
  const required = [
    "narukana_init",
    "narukana_context_create",
    "narukana_ui_spec_create",
    "narukana_contract_spec_create",
    "narukana_integration_spec_create",
    "narukana_plan_create",
    "narukana_spec_from_codebase_create",
    "narukana_execute_task",
    "narukana_sync",
    "narukana_ui_spec_validate",
    "narukana_contract_spec_validate",
    "narukana_integration_spec_validate",
    "narukana_ui_validate",
    "narukana_contract_validate",
    "narukana_integration_validate",
  ];

  for (const k of required) {
    if (!hooks.tool[k]) throw new Error(`Missing tool: ${k}`);
  }

  console.log("VERIFY_OK: tool map present");
}

main().catch((e) => {
  console.error("VERIFY_FAIL", e);
  process.exit(1);
});
