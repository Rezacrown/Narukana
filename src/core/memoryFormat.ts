import { hashFileContent } from "./hashing";
import type { TasksLedger } from "./planFormat";

export interface MemorySources {
  contextHash: string;
  uiSpecHash: string;
  contractHash: string;
  integrationHash: string;
  planHash: string;
}

export interface MemoryFrontmatter {
  schemaVersion: 1;
  planId: string;
  generatedAt: string;
  sources: MemorySources;
}

export interface MemoryDocument {
  metadata: MemoryFrontmatter;
  body: string;
}

export interface MemoryBuildInput {
  planContent: string;
  contextContent: string;
  uiSpecContent: string;
  contractContent: string;
  integrationContent: string;
  ledger: TasksLedger;
  planId: string;
}

function parseSources(block: string): MemorySources {
  const keys: Array<keyof MemorySources> = [
    "contextHash",
    "uiSpecHash",
    "contractHash",
    "integrationHash",
    "planHash",
  ];

  const out = {} as MemorySources;
  for (const key of keys) {
    const match = block.match(new RegExp(`^\\s{2}${key}:\\s*(.+)$`, "m"));
    if (!match || !match[1].trim()) {
      throw new Error(`memory frontmatter missing sources.${key}`);
    }
    out[key] = match[1].trim();
  }

  return out;
}

export function parseMemory(content: string): MemoryDocument {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!frontmatterMatch) {
    throw new Error("memory frontmatter not found");
  }

  const fm = frontmatterMatch[1];
  const schemaMatch = fm.match(/^schemaVersion:\s*(\d+)$/m);
  const planIdMatch = fm.match(/^planId:\s*(.+)$/m);
  const generatedAtMatch = fm.match(/^generatedAt:\s*(.+)$/m);
  const hasSources = /^sources:\s*$/m.test(fm);

  if (!schemaMatch) throw new Error("memory frontmatter missing schemaVersion");
  if (!planIdMatch || !planIdMatch[1].trim()) {
    throw new Error("memory frontmatter missing planId");
  }
  if (!generatedAtMatch || !generatedAtMatch[1].trim()) {
    throw new Error("memory frontmatter missing generatedAt");
  }
  if (!hasSources) throw new Error("memory frontmatter missing sources block");

  const schemaVersion = Number(schemaMatch[1]);
  if (schemaVersion !== 1) {
    throw new Error(`unsupported memory schemaVersion: ${schemaVersion}`);
  }

  const metadata: MemoryFrontmatter = {
    schemaVersion: 1,
    planId: planIdMatch[1].trim(),
    generatedAt: generatedAtMatch[1].trim(),
    sources: parseSources(fm),
  };

  const body = content.slice(frontmatterMatch[0].length).trimStart();
  return { metadata, body };
}

export function buildMemorySources(input: Omit<MemoryBuildInput, "ledger" | "planId">): MemorySources {
  return {
    contextHash: hashFileContent(input.contextContent),
    uiSpecHash: hashFileContent(input.uiSpecContent),
    contractHash: hashFileContent(input.contractContent),
    integrationHash: hashFileContent(input.integrationContent),
    planHash: hashFileContent(input.planContent),
  };
}

function firstNonEmptyLines(content: string, count: number): string[] {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, count);
}

function parseUiActions(uiSpecContent: string): string[] {
  const start = uiSpecContent.indexOf("<!-- narukana-ui-actions -->");
  const end = uiSpecContent.indexOf("<!-- /narukana-ui-actions -->");
  if (start === -1 || end === -1 || end <= start) return [];

  const block = uiSpecContent.slice(start, end);
  return block
    .split("\n")
    .map((line) => line.trim().match(/^- action:\s*(.+)$/)?.[1]?.trim())
    .filter((x): x is string => Boolean(x));
}

function parseContractOperationNames(contractContent: string): string[] {
  try {
    const parsed = JSON.parse(contractContent);
    if (!parsed.operations || typeof parsed.operations !== "object") return [];
    return Object.keys(parsed.operations);
  } catch {
    return [];
  }
}

function countStatuses(ledger: TasksLedger) {
  const values = ["todo", "in_progress", "done", "failed", "blocked", "skipped"] as const;
  const result = {} as Record<(typeof values)[number], number>;
  for (const status of values) {
    result[status] = ledger.tasks.filter((t) => t.state.status === status).length;
  }
  return result;
}

export function generateMemoryMarkdown(input: MemoryBuildInput): string {
  const generatedAt = new Date().toISOString();
  const sources = buildMemorySources(input);
  const uiActions = parseUiActions(input.uiSpecContent);
  const operations = parseContractOperationNames(input.contractContent);
  const statuses = countStatuses(input.ledger);
  const contextLines = firstNonEmptyLines(input.contextContent, 4);
  const integrationLines = firstNonEmptyLines(input.integrationContent, 5);
  const nextTodo = input.ledger.tasks.find((t) => t.state.status === "todo");

  const lines = [
    "---",
    "schemaVersion: 1",
    `planId: ${input.planId}`,
    `generatedAt: ${generatedAt}`,
    "sources:",
    `  contextHash: ${sources.contextHash}`,
    `  uiSpecHash: ${sources.uiSpecHash}`,
    `  contractHash: ${sources.contractHash}`,
    `  integrationHash: ${sources.integrationHash}`,
    `  planHash: ${sources.planHash}`,
    "---",
    "# Memory Brief",
    "",
    "## Project Snapshot",
    `- Plan ID: ${input.planId}`,
    `- Total tasks: ${input.ledger.tasks.length}`,
    `- Context highlights: ${contextLines.join(" | ") || "(not available)"}`,
    "",
    "## Scope and Non-Goals",
    "- Scope is derived from context/spec files under `.narukana/`.",
    "- Non-goals must be read from `.narukana/context/context.md` before adding work.",
    "- This memory file is derived; do not treat it as source of truth.",
    "",
    "## UI Actions Summary",
    ...(uiActions.length > 0 ? uiActions.map((a) => `- ${a}`) : ["- No UI actions declared."]),
    "",
    "## Contract Operations Summary",
    ...(operations.length > 0 ? operations.map((op) => `- ${op}`) : ["- No operations declared."]),
    "",
    "## Integration Mapping Summary",
    ...(integrationLines.length > 0 ? integrationLines.map((line) => `- ${line}`) : ["- Integration summary not available."]),
    "",
    "## Execution Rules",
    "- Source of truth is `.narukana/context/*`, `.narukana/specs/*`, `.narukana/plan.md`, and `.narukana/tasks.json`.",
    "- Keep `tasks.json` schemaVersion=1 and `meta.planId` aligned with current plan.",
    "- If memory hash/planId is stale, regenerate memory before relying on it.",
    "",
    "## Current Plan and Task State",
    `- todo: ${statuses.todo}`,
    `- in_progress: ${statuses.in_progress}`,
    `- done: ${statuses.done}`,
    `- failed: ${statuses.failed}`,
    `- blocked: ${statuses.blocked}`,
    `- skipped: ${statuses.skipped}`,
    `- Next todo candidate: ${nextTodo ? `${nextTodo.definition.id} - ${nextTodo.definition.title}` : "none"}`,
    "",
    "## Known Risks / Open Questions",
    "- Risks are not inferred beyond source files; review context and plan risk tags directly.",
    "- Any unresolved dependency or failed task should be treated as a blocker.",
    "",
    "## Fresh Agent Checklist",
    "- Verify `planId` matches `.narukana/plan.md`.",
    "- Verify `tasks.json` uses schemaVersion=1 and has `meta.planId`.",
    "- Use `narukana_execute_task action:\"next\"` to claim work.",
    "- Update status via `report` and avoid editing derived artifacts manually.",
  ];

  return `${lines.join("\n")}\n`;
}
