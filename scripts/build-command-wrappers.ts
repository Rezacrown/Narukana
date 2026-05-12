import { mkdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const commandsDir = join(rootDir, "src", "commands");
const outputDir = join(rootDir, "command");

async function ensureDir(path: string) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

const tools = [
  {
    name: "narukana_init",
    description: "Initialize Narukana workspace with required directories and default template files",
    params: {},
  },
  {
    name: "narukana_context_create",
    description: "Create or regenerate context.md in .narukana/context/",
    params: {
      regenerate: "boolean (default: false) - overwrite existing file if true",
      include: "string (optional) - manual context content to use",
    },
  },
  {
    name: "narukana_ui_spec_create",
    description: "Create or regenerate ui.md spec in .narukana/specs/",
    params: {
      regenerate: "boolean (default: false) - overwrite existing file if true",
    },
  },
  {
    name: "narukana_contract_spec_create",
    description: "Create or regenerate contract.json and contract-detail.md specs in .narukana/specs/",
    params: {
      regenerate: "boolean (default: false) - overwrite existing files if true",
    },
  },
  {
    name: "narukana_integration_spec_create",
    description: "Create or regenerate integration.md spec in .narukana/specs/",
    params: {
      regenerate: "boolean (default: false) - overwrite existing file if true",
    },
  },
  {
    name: "narukana_plan_create",
    description: "Generate plan.md from specs (context, ui, contract, integration)",
    params: {
      regenerate: "boolean (default: true) - overwrite existing plan if true",
    },
  },
  {
    name: "narukana_spec_from_codebase_create",
    description: "Scan an existing codebase and generate Narukana-compliant spec files",
    params: {
      write: "boolean (default: false) - false = preview only, true = write all spec files",
      regenerate: "boolean (default: false) - overwrite existing spec files if true",
    },
  },
  {
    name: "narukana_execute_task",
    description: "Execute task actions: next, report, status, release",
    params: {
      action: '"next" | "report" | "status" | "release" - action to perform',
      name: "string (optional) - name/identifier for the agent claiming the task",
      leaseMinutes: "number (default: 120) - lease duration in minutes",
      taskId: "string (required for report/release) - task ID",
      status: '"in_progress" | "done" | "failed" | "blocked" | "skipped" (for report)',
      fatalReason: "string (optional) - reason if task failed fatally",
      evidence: "string (optional) - evidence/completion message",
    },
  },
  {
    name: "narukana_sync",
    description: "Verify presence of required files up to plan (read-only)",
    params: {},
  },
  {
    name: "narukana_ui_spec_validate",
    description: "Validate UI spec structure (read-only)",
    params: {},
  },
  {
    name: "narukana_contract_spec_validate",
    description: "Validate contract.json structure (read-only)",
    params: {},
  },
  {
    name: "narukana_integration_spec_validate",
    description: "Validate integration.md structure (read-only)",
    params: {},
  },
  {
    name: "narukana_ui_validate",
    description: "Deep-scan: validate UI action implementation evidence exists (read-only)",
    params: {},
  },
  {
    name: "narukana_contract_validate",
    description: "Deep-scan: validate contract operation implementation evidence exists (read-only)",
    params: {},
  },
  {
    name: "narukana_integration_validate",
    description: "Deep-scan: validate integration consistency between UI and backend (read-only)",
    params: {},
  },
];

function generateWrapper(tool: typeof tools[0]): string {
  let paramsText = "";
  if (Object.keys(tool.params).length > 0) {
    paramsText = "\n**Parameters:**\n";
    for (const [key, desc] of Object.entries(tool.params)) {
      paramsText += `- \`${key}\`: ${desc}\n`;
    }
  } else {
    paramsText = "\n**Parameters:** None\n";
  }

  return `# ${tool.name}

${tool.description}${paramsText}

## Usage

\`\`\`json
{
  "name": "${tool.name}",
  "arguments": {}
}
\`\`\`
`;
}

async function build() {
  await ensureDir(commandsDir);
  await ensureDir(outputDir);

  for (const tool of tools) {
    const content = generateWrapper(tool);
    const filename = tool.name.replace("narukana_", "") + ".md";

    // Ship source wrapper (tracked in repo)
    await writeFile(join(commandsDir, filename), content);

    // Generated command wrapper (runtime)
    await writeFile(join(outputDir, filename), content);
  }

  console.log(
    `Generated ${tools.length} command wrappers in ${commandsDir} and ${outputDir}`,
  );
}

build();
