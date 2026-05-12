import { tool } from "@opencode-ai/plugin";
import { paths, fileExists, createBackupPath, getTimestamp } from "../core/fileSystem";
import { SCHEMA_VERSION } from "../core/constants";
import { getNarukanaFs } from "../core/narukanaFs";
import { isValidConfig, type NarukanaConfig } from "../core/config";

interface CodebaseInventory {
  schemaVersion: number;
  generatedAt: string;
  sourceRoots: { ui: string; contract: string };
  ui: {
    framework: string;
    pages: string[];
    components: string[];
    apiCalls: { method: string; path: string; file: string }[];
  };
  backend: {
    runtime: string;
    routes: { method: string; path: string; handler: string }[];
    middleware: string[];
  };
  contract: {
    language: string;
    contracts: {
      name: string;
      functions: { name: string; visibility: string; params: string[] }[];
      events: string[];
    }[];
  };
  integration: {
    mappings: { uiAction: string; calls: string; type: "http" | "contract" }[];
  };
  suggestedSpecs: {
    context: string;
    ui: string;
    contract: object;
    contractDetail: string;
    integration: string;
  };
}

const UI_GLOB = "**/*.{ts,tsx,js,jsx,vue,svelte}";
const BACKEND_GLOB = "**/*.{ts,js,py,go,rs}";
const CONTRACT_GLOB = "**/*.{sol,cairo,move,rs,vy}";

const PAGE_DIR_PATTERNS = ["pages/", "app/", "views/", "routes/"];
const PAGE_SUFFIXES = ["Page", "View", "Route"];

const HTTP_CLIENT_PATTERNS = [
  /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /axios\.(\w+)\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /api\.(\w+)\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /useQuery\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /useMutation\s*\(\s*["'`]([^"'`]+)["'`]/g,
];

const UI_HANDLER_PATTERNS = [
  /handle(\w+)/g,
  /on[A-Z]\w+/g,
  /<button[^>]*>([^<]+)<\/button>/gi,
  /<a[^>]*>([^<]+)<\/a>/gi,
];

const FRAMEWORK_MARKERS: Record<string, { name: string; patterns: RegExp[] }> = {
  next: { name: "next.js", patterns: [/import\s.*from\s["']next\//, /export (default|const)\s.*getServerSideProps/, /export (default|const)\s.*getStaticProps/] },
  react: { name: "react", patterns: [/import\s.*React\s.*from\s["']react["']/, /import\s.*from\s["']react["']/, /React\.Component/, /useState/, /useEffect/] },
  vue: { name: "vue", patterns: [/<template>/, /<script\s+setup/, /defineComponent/, /createApp/] },
  svelte: { name: "svelte", patterns: [/<script>.*export\s+let/, /\$\:(\s|{)/, /on:click/] },
};

const BACKEND_RUNTIME_PATTERNS: Record<string, { name: string; patterns: RegExp[] }> = {
  express: { name: "express", patterns: [/require\s*\(\s*["']express["']/, /import\s.*from\s["']express["']/, /app\.\w+\s*\(/, /router\.\w+\s*\(/] },
  fastify: { name: "fastify", patterns: [/require\s*\(\s*["']fastify["']/, /import\s.*from\s["']fastify["']/, /fastify\.\w+\s*\(/, /server\.\w+\s*\(/] },
  flask: { name: "flask", patterns: [/from\s+flask\s+import/, /@app\.route\(/] },
  fastapi: { name: "fastapi", patterns: [/from\s+fastapi\s+import/, /@app\.\w+\s*\(/, /@router\.\w+\s*\(/] },
  django: { name: "django", patterns: [/urlpatterns/, /path\s*\(/, /re_path\s*\(/] },
  go_fiber: { name: "go/fiber", patterns: [/app\.\w+\s*\(/, /r\.\w+\s*\(/] },
  go_gin: { name: "go/gin", patterns: [/r\.\w+\s*\(/] },
  go_native: { name: "go/net/http", patterns: [/http\.HandleFunc\(/] },
  rust_actix: { name: "rust/actix", patterns: [/#\[get\(/, /#\[post\(/, /#\[put\(/, /#\[delete\(/] },
  rust_axum: { name: "rust/axum", patterns: [/\.route\(/] },
};

const ROUTE_EXTRACTORS: Record<string, RegExp> = {
  express: /(app|router)\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  fastify: /(fastify|server)\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  flask: /@app\.route\s*\(\s*["'`]([^"'`]+)["'`]\s*,\s*methods\s*=\s*\[([^\]]+)\]|@app\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  fastapi: /@(app|router)\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  django: /path\s*\(\s*["'`]([^"'`]+)["'`]\s*,\s*(\w+)/gi,
  go_fiber: /(app|r)\.(Get|Post|Put|Delete|Patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  go_native: /http\.HandleFunc\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  rust_actix: /#\[(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)\]/gi,
  rust_axum: /\.route\s*\(\s*["'`]([^"'`]+)["'`]/gi,
};

const NEXT_API_DIRS = ["pages/api/", "app/api/"];

const MIDDLEWARE_PATTERNS = [
  /app\.use\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /app\.use\s*\((\w+)\)/g,
  /router\.use\s*\((\w+)\)/g,
  /add_middleware\s*\(\s*(\w+)/g,
  /\.layer\s*\(\s*(\w+)/g,
];

const SOLIDITY_PATTERNS = {
  contract: /contract\s+(\w+)/g,
  function: /function\s+(\w+)\s*\(([^)]*)\)(?:\s+(public|external|internal|private))?/g,
  event: /event\s+(\w+)\s*\(/g,
  struct: /struct\s+(\w+)/g,
};

const CAIRO_PATTERNS = {
  contract: /#\[starknet::contract\]/g,
  function: /fn\s+(\w+)\s*\(([^)]*)\)/g,
  event: /#\[event\]\s*\n\s*fn\s+(\w+)/g,
  struct: /struct\s+(\w+)/g,
};

const MOVE_PATTERNS = {
  module: /module\s+\w+::(\w+)/g,
  function: /public\s+(entry\s+)?fun\s+(\w+)\s*\(([^)]*)\)/g,
  event: /emit\s+(\w+)/g,
};

const RUST_INK_PATTERNS = {
  contract: /#\[ink::contract\]/g,
  message: /#\[ink\(message\)\]\s*\n\s*(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)/g,
  event: /#\[ink\(event\)\]\s*\n\s*(?:pub\s+)?struct\s+(\w+)/g,
};

const VYPER_PATTERNS = {
  external: /@external\s*\n\s*def\s+(\w+)\s*\(([^)]*)\)/g,
  view: /@view\s*\n\s*def\s+(\w+)\s*\(([^)]*)\)/g,
  event: /event\s+(\w+)/g,
};

function sanitizeName(name: string): string {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function readFileIfExists(fs: any, rootPath: string, filePath: string): Promise<string | null> {
  try {
    const fullPath = filePath.startsWith(rootPath) ? filePath : `${rootPath}/${filePath}`;
    return await fs.readFile(fullPath);
  } catch {
    return null;
  }
}

async function scanUI(fs: any, rootPath: string): Promise<CodebaseInventory["ui"]> {
  const files = await fs.glob(UI_GLOB, { cwd: rootPath });
  const pages: string[] = [];
  const components: string[] = [];
  const apiCalls: { method: string; path: string; file: string }[] = [];
  let framework = "unknown";

  for (const file of files) {
    const relative = file.replace(rootPath + "/", "").replace(rootPath + "\\", "").replace(/\\/g, "/");
    const content = await readFileIfExists(fs, rootPath, file);
    if (!content) continue;

    if (framework === "unknown") {
      for (const [key, marker] of Object.entries(FRAMEWORK_MARKERS)) {
        if (marker.patterns.some((p) => p.test(content))) {
          framework = marker.name;
          break;
        }
      }
    }

    const isPageDir = PAGE_DIR_PATTERNS.some((dir) => relative.startsWith(dir));
    if (isPageDir) {
      pages.push(relative);
    }

    for (const suffix of PAGE_SUFFIXES) {
      if (relative.endsWith(`${suffix}.ts`) || relative.endsWith(`${suffix}.tsx`) || relative.endsWith(`${suffix}.jsx`)) {
        if (!pages.includes(relative)) pages.push(relative);
      }
    }

    const exportedMatches = content.matchAll(/(?:export\s+(?:default\s+)?(?:function|class|const))\s+(\w+)/g);
    for (const match of exportedMatches) {
      components.push(match[1]);
    }

    for (const pattern of HTTP_CLIENT_PATTERNS) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        let method = "GET";
        let path = "";
        if (pattern === HTTP_CLIENT_PATTERNS[0]) {
          path = match[1];
        } else if (pattern === HTTP_CLIENT_PATTERNS[1] || pattern === HTTP_CLIENT_PATTERNS[2]) {
          method = match[1].toUpperCase();
          path = match[2];
        } else if (pattern === HTTP_CLIENT_PATTERNS[3] || pattern === HTTP_CLIENT_PATTERNS[4]) {
          path = match[1];
        }

        if (path && path.length < 300 && !path.includes("${")) {
          apiCalls.push({ method, path, file: relative });
        }
      }
    }
  }

  return {
    framework,
    pages: [...new Set(pages)],
    components: [...new Set(components)],
    apiCalls,
  };
}

async function scanBackend(fs: any, rootPath: string): Promise<CodebaseInventory["backend"]> {
  const files = await fs.glob(BACKEND_GLOB, { cwd: rootPath });
  const routes: { method: string; path: string; handler: string }[] = [];
  const middleware: string[] = [];
  let runtime = "unknown";

  for (const file of files) {
    const relative = file.replace(rootPath + "/", "").replace(rootPath + "\\", "").replace(/\\/g, "/");
    const content = await readFileIfExists(fs, rootPath, file);
    if (!content) continue;

    if (runtime === "unknown") {
      for (const [key, marker] of Object.entries(BACKEND_RUNTIME_PATTERNS)) {
        if (marker.patterns.some((p) => p.test(content))) {
          runtime = marker.name;
          break;
        }
      }
    }

    const isNextApi = NEXT_API_DIRS.some((dir) => relative.startsWith(dir));
    if (isNextApi) {
      runtime = "next.js-api";
      const pathPart = relative
        .replace(/^pages\/api\//, "")
        .replace(/^app\/api\//, "")
        .replace(/\/route\.(ts|js)$/, "")
        .replace(/\.(ts|js)$/, "");
      const method = relative.match(/route\.(ts|js)$/) ? "ALL" : "GET";
      routes.push({
        method,
        path: "/api/" + pathPart.replace(/\[([^\]]+)\]/g, ":$1"),
        handler: relative.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "handler",
      });
    }

    for (const [key, extractor] of Object.entries(ROUTE_EXTRACTORS)) {
      const matches = content.matchAll(extractor);
      for (const match of matches) {
        if (key === "flask") {
          if (match[1] && match[2]) {
            const methods = match[2].replace(/['"\s]/g, "").split(",").map((m: string) => m.trim().toUpperCase());
            for (const m of methods) {
              routes.push({ method: m, path: match[1], handler: sanitizeName(match[1].replace(/[/<>]/g, "_")) });
            }
          }
          if (match[3] && match[4]) {
            routes.push({
              method: match[3].toUpperCase(),
              path: match[4],
              handler: sanitizeName(match[4].replace(/[/<>]/g, "_")),
            });
          }
        } else if (key === "django") {
          routes.push({ method: "GET", path: match[1], handler: match[2] });
        } else if (key === "go_native") {
          routes.push({ method: "GET", path: match[1], handler: sanitizeName(match[1].replace(/[/<>]/g, "_")) });
        } else if (key === "rust_axum") {
          routes.push({ method: "ALL", path: match[1], handler: sanitizeName(match[1].replace(/[/<>]/g, "_")) });
        } else {
          const mParts = match as unknown as string[];
          if (mParts.length >= 3) {
            routes.push({
              method: mParts[2].toUpperCase(),
              path: mParts[3],
              handler: sanitizeName(mParts[3].replace(/[/<>]/g, "_")),
            });
          }
        }
      }
    }

    for (const mPattern of MIDDLEWARE_PATTERNS) {
      const matches = content.matchAll(mPattern);
      for (const match of matches) {
        const mwName = match[1].replace(/['"]/g, "").trim();
        if (mwName && !middleware.includes(mwName)) {
          middleware.push(mwName);
        }
      }
    }
  }

  return {
    runtime,
    routes: routes.slice(0, 500),
    middleware: [...new Set(middleware)],
  };
}

async function scanContract(fs: any, rootPath: string): Promise<CodebaseInventory["contract"]> {
  const files = await fs.glob(CONTRACT_GLOB, { cwd: rootPath });
  const contracts: CodebaseInventory["contract"]["contracts"] = [];
  let language = "unknown";

  for (const file of files) {
    const content = await readFileIfExists(fs, rootPath, file);
    if (!content) continue;

    if (language === "unknown") {
      if (/contract\s+\w+/.test(content) || /function\s+\w+/.test(content)) language = "solidity";
      else if (/#\[starknet::contract\]/.test(content)) language = "cairo";
      else if (/module\s+\w+::\w+/.test(content)) language = "move";
      else if (/#\[ink::contract\]/.test(content)) language = "rust-ink";
      else if (/@external/.test(content) || /@view/.test(content)) language = "vyper";
    }

    if (language === "solidity") {
      const contractMatches = content.matchAll(SOLIDITY_PATTERNS.contract);
      for (const cm of contractMatches) {
        const contractName = cm[1];
        const funcBlock = content.slice(content.indexOf(cm[0]));
        const endIdx = funcBlock.indexOf("contract ") > -1
          ? Math.min(funcBlock.indexOf("contract ", 10), funcBlock.length)
          : funcBlock.length;
        const contractContent = funcBlock.slice(0, endIdx);

        const functions: { name: string; visibility: string; params: string[] }[] = [];
        const fnMatches = contractContent.matchAll(SOLIDITY_PATTERNS.function);
        for (const fm of fnMatches) {
          functions.push({
            name: fm[1],
            visibility: fm[3] || "public",
            params: fm[2].split(",").map((p: string) => p.trim()).filter(Boolean),
          });
        }

        const events: string[] = [];
        const evMatches = contractContent.matchAll(SOLIDITY_PATTERNS.event);
        for (const ev of evMatches) events.push(ev[1]);

        contracts.push({ name: contractName, functions, events });
      }
    } else if (language === "cairo") {
      if (CAIRO_PATTERNS.contract.test(content)) {
        const contractName = file.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "contract";
        const functions: { name: string; visibility: string; params: string[] }[] = [];
        const fnMatches = content.matchAll(CAIRO_PATTERNS.function);
        for (const fm of fnMatches) {
          functions.push({
            name: fm[1],
            visibility: "public",
            params: fm[2].split(",").map((p: string) => p.trim()).filter(Boolean),
          });
        }
        const events: string[] = [];
        const evMatches = content.matchAll(CAIRO_PATTERNS.event);
        for (const ev of evMatches) events.push(ev[1]);
        contracts.push({ name: contractName, functions, events });
      }
    } else if (language === "move") {
      const modMatches = content.matchAll(MOVE_PATTERNS.module);
      for (const mm of modMatches) {
        const moduleName = mm[1];
        const functions: { name: string; visibility: string; params: string[] }[] = [];
        const fnMatches = content.matchAll(MOVE_PATTERNS.function);
        for (const fm of fnMatches) {
          functions.push({
            name: fm[2],
            visibility: fm[1] ? "public-entry" : "public",
            params: fm[3].split(",").map((p: string) => p.trim()).filter(Boolean),
          });
        }
        const events: string[] = [];
        const evMatches = content.matchAll(MOVE_PATTERNS.event);
        for (const ev of evMatches) events.push(ev[1]);
        contracts.push({ name: moduleName, functions, events });
      }
    } else if (language === "rust-ink") {
      if (RUST_INK_PATTERNS.contract.test(content)) {
        const contractName = file.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "contract";
        const functions: { name: string; visibility: string; params: string[] }[] = [];
        const fnMatches = content.matchAll(RUST_INK_PATTERNS.message);
        for (const fm of fnMatches) {
          functions.push({
            name: fm[1],
            visibility: "public",
            params: fm[2].split(",").map((p: string) => p.trim()).filter(Boolean),
          });
        }
        const events: string[] = [];
        const evMatches = content.matchAll(RUST_INK_PATTERNS.event);
        for (const ev of evMatches) events.push(ev[1]);
        contracts.push({ name: contractName, functions, events });
      }
    } else if (language === "vyper") {
      const contractName = file.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "contract";
      const functions: { name: string; visibility: string; params: string[] }[] = [];
      const extMatches = content.matchAll(VYPER_PATTERNS.external);
      for (const fm of extMatches) {
        functions.push({
          name: fm[1],
          visibility: "external",
          params: fm[2].split(",").map((p: string) => p.trim()).filter(Boolean),
        });
      }
      const viewMatches = content.matchAll(VYPER_PATTERNS.view);
      for (const fm of viewMatches) {
        functions.push({
          name: fm[1],
          visibility: "view",
          params: fm[2].split(",").map((p: string) => p.trim()).filter(Boolean),
        });
      }
      const events: string[] = [];
      const evMatches = content.matchAll(VYPER_PATTERNS.event);
      for (const ev of evMatches) events.push(ev[1]);
      contracts.push({ name: contractName, functions, events });
    }
  }

  return { language, contracts };
}

function mapIntegration(
  uiInv: CodebaseInventory["ui"],
  backendInv: CodebaseInventory["backend"],
  contractInv: CodebaseInventory["contract"],
): CodebaseInventory["integration"]["mappings"] {
  const mappings: CodebaseInventory["integration"]["mappings"] = [];

  for (const apiCall of uiInv.apiCalls) {
    let matched = false;
    const methodUpper = apiCall.method.toUpperCase();
    for (const route of backendInv.routes) {
      const routeMethod = route.method.toUpperCase();
      if (
        (routeMethod === methodUpper || routeMethod === "ALL") &&
        (apiCall.path.includes(route.path) || route.path.includes(apiCall.path) || apiCall.path === route.path)
      ) {
        mappings.push({
          uiAction: `api call in ${apiCall.file}`,
          calls: `${methodUpper} ${route.path}`,
          type: "http",
        });
        matched = true;
        break;
      }
    }
    if (!matched) {
      mappings.push({
        uiAction: `api call in ${apiCall.file}`,
        calls: `${methodUpper} ${apiCall.path}`,
        type: "http",
      });
    }
  }

  for (const ct of contractInv.contracts) {
    for (const fn of ct.functions) {
      const fnLower = fn.name.toLowerCase();
      const matchingApiCall = uiInv.apiCalls.find((ac) =>
        ac.path.toLowerCase().includes(fnLower) || ac.path.toLowerCase().includes("contract")
      );
      if (matchingApiCall) {
        mappings.push({
          uiAction: `contract call in ${matchingApiCall.file}`,
          calls: `${ct.name}.${fn.name}`,
          type: "contract",
        });
      }
    }
  }

  return mappings;
}

function generateContextMarkdown(inventory: CodebaseInventory): string {
  const uiDesc = inventory.ui.framework !== "unknown"
    ? `Detected UI framework: ${inventory.ui.framework}`
    : "No UI framework detected";
  const backendDesc = inventory.backend.runtime !== "unknown"
    ? `Detected backend runtime: ${inventory.backend.runtime}`
    : "No backend runtime detected";
  const contractDesc = inventory.contract.language !== "unknown"
    ? `Detected contract language: ${inventory.contract.language}`
    : "No smart contracts detected";

  return `# Context\n\n## Goal\n(Auto-generated from codebase scan - please review and expand)\n\n${uiDesc}\n${backendDesc}\n${contractDesc}\n\n## System Overview\n- UI source: \`${inventory.sourceRoots.ui || "root"}\`\n- Contract source: \`${inventory.sourceRoots.contract || "root"}\`\n- UI pages found: ${inventory.ui.pages.length}\n- Backend routes found: ${inventory.backend.routes.length}\n- Contracts found: ${inventory.contract.contracts.length}\n\n## Constraints\n- (Add deployment constraints)\n- (Add performance constraints)\n- (Add security constraints)\n\n## Assumptions\n- This document was generated from static code analysis. Verify manually.\n\n## Non-Goals\n- (List what is NOT being built)\n\n## Risks\n- (List biggest risks and unknowns)\n`;
}

function generateUiSpec(inventory: CodebaseInventory): string {
  const uiActionNames = inventory.ui.apiCalls.map((ac) =>
    sanitizeName(ac.path.replace(/^\/+/, "").replace(/\//g, "_"))
  );
  const entities = [
    ...new Set(
      inventory.ui.apiCalls.map((ac) => {
        const parts = ac.path.split("/").filter(Boolean);
        return parts.length > 0 ? parts[0] : "root";
      })
    ),
  ];

  return `# UI Spec\n\n## Description\nAuto-generated from codebase scan. ${inventory.ui.components.length} components and ${inventory.ui.pages.length} pages detected.\n\n## Layout / Components\n${inventory.ui.pages.map((p) => `- \`${p}\``).join("\n")}\n\n## States\n- loading\n- empty\n- error\n- success\n\n<!-- narukana-ui-actions -->\n${uiActionNames.map((a) => `- action: ${a}`).join("\n")}\n<!-- /narukana-ui-actions -->\n\n<!-- narukana-ui-data -->\n${entities.map((e) => `- entity: ${e}`).join("\n")}\n<!-- /narukana-ui-data -->\n\n## User Flow\n1) User opens app\n2) User triggers an action\n3) UI calls an operation\n4) UI updates state\n`;
}

function generateContractJson(inventory: CodebaseInventory): object {
  const operations: Record<string, object> = {};

  for (const route of inventory.backend.routes) {
    const opName = sanitizeName(route.path.replace(/^\/+/, "").replace(/\//g, "_")).toLowerCase();
    if (!operations[opName]) {
      operations[opName] = {
        type: route.method === "GET" ? "query" : "mutation",
        transport: "http",
        method: route.method,
        path: route.path,
        handler: route.handler,
      };
    }
  }

  for (const ct of inventory.contract.contracts) {
    for (const fn of ct.functions) {
      const opName = `${ct.name}_${fn.name}`.toLowerCase();
      operations[opName] = {
        type: fn.name.startsWith("get") || fn.name.startsWith("view") || fn.name.startsWith("query") ? "query" : "mutation",
        transport: "contract",
        contract: ct.name,
        function: fn.name,
        visibility: fn.visibility,
      };
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    name: "codebase-operations",
    domain: "",
    operations,
  };
}

function generateContractDetail(inventory: CodebaseInventory): string {
  let md = "# Contract / API Details\n\n> This file explains each operation from `contract.json` in human terms.\n\n";

  for (const route of inventory.backend.routes) {
    const opName = sanitizeName(route.path.replace(/^\/+/, "").replace(/\//g, "_")).toLowerCase();
    md += `## Operation: ${opName}\n`;
    md += `- Type: ${route.method === "GET" ? "query" : "mutation"}\n`;
    md += "- Transport: http\n\n";
    md += `### Purpose\nHTTP ${route.method} ${route.path}\n\n`;
    md += "### Input\n- (input field): (type)\n\n";
    md += "### Output\n- (output field): (type)\n\n";
    md += "### Errors\n- (error cases)\n\n";
    md += "### Notes\n- (additional notes)\n\n";
  }

  for (const ct of inventory.contract.contracts) {
    for (const fn of ct.functions) {
      const opName = `${ct.name}_${fn.name}`.toLowerCase();
      md += `## Operation: ${opName}\n`;
      md += `- Type: ${fn.name.startsWith("get") || fn.name.startsWith("view") ? "query" : "mutation"}\n`;
      md += "- Transport: contract\n\n";
      md += `### Purpose\n${ct.name}.${fn.name}(${fn.params.join(", ")})\n\n`;
      md += `### Input\n${fn.params.length > 0 ? fn.params.map((p) => `- ${p}: (type)`).join("\n") : "- (none)"}\n\n`;
      md += "### Output\n- (output field): (type)\n\n";
      md += "### Errors\n- (error cases)\n\n";
      md += "### Notes\n- (additional notes)\n\n";
    }
  }

  return md;
}

function generateIntegrationSpec(inventory: CodebaseInventory): string {
  let md = "# Integration Flow\n\n## Runtime Flow\nUI action -> operation call -> response -> UI state update\n\n## Mappings\n";
  for (const mapping of inventory.integration.mappings) {
    md += `- action: ${mapping.uiAction}\n`;
    md += `  calls:\n`;
    md += `    - op: ${mapping.calls}\n`;
    md += `  success:\n`;
    md += `    - ui: (success state update)\n`;
    md += `  error:\n`;
    md += `    - ui: (error state update)\n`;
  }
  md += "\n## Contract Operations\n";
  for (const ct of inventory.contract.contracts) {
    for (const fn of ct.functions) {
      md += `- ${ct.name}.${fn.name}\n`;
    }
  }
  md += "\n## Error Handling\n- Standardize error surface to user-friendly messages\n\n## Observability\n- Log errors with action + op + correlation id\n";
  return md;
}

function generateTechstackMd(inventory: CodebaseInventory): string {
  const techs: string[] = [];
  if (inventory.ui.framework !== "unknown") techs.push(`UI Framework: ${inventory.ui.framework}`);
  if (inventory.backend.runtime !== "unknown") techs.push(`Backend Runtime: ${inventory.backend.runtime}`);
  if (inventory.contract.language !== "unknown") techs.push(`Contract Language: ${inventory.contract.language}`);

  return `# Tech Stack\n\n## Detected Technologies\n${techs.map((t) => `- ${t}`).join("\n")}\n\n## Additional Details\n- (Add specific library versions)\n- (Add database if detected)\n- (Add deployment platform)\n`;
}

function generateArchitectureMd(inventory: CodebaseInventory): string {
  return `# Architecture\n\n## High-Level Overview\nThis architecture was detected from static code analysis.\n\n## Layers\n\n### UI Layer\n${inventory.ui.framework !== "unknown" ? `Framework: ${inventory.ui.framework}\nPages: ${inventory.ui.pages.length}\nComponents: ${inventory.ui.components.length}` : "No UI layer detected."}\n\n### Backend Layer\n${inventory.backend.runtime !== "unknown" ? `Runtime: ${inventory.backend.runtime}\nRoutes: ${inventory.backend.routes.length}\nMiddleware: ${inventory.backend.middleware.length}` : "No backend layer detected."}\n\n### Contract Layer\n${inventory.contract.language !== "unknown" ? `Language: ${inventory.contract.language}\nContracts: ${inventory.contract.contracts.length}` : "No contract layer detected."}\n\n## Data Flow\nUI ↔ Backend (HTTP) ↔ Database/Contracts\nUI ↔ Contracts (Direct)\n\n## Deployment\n- (Add deployment architecture details)\n`;
}

function generateProjectMd(inventory: CodebaseInventory): string {
  return `# Project Overview\n\n## Directory Structure\n- \`${inventory.sourceRoots.ui || "root"}\` - UI source\n- \`${inventory.sourceRoots.contract || "root"}\` - Contract source\n\n## Conventions\n- File naming: (add naming conventions)\n- Code style: (add code style conventions)\n- Testing: (add testing conventions)\n\n## Dependencies\n- (Add key project dependencies)\n`;
}

async function ensureNarukanaWorkspace(fs: any): Promise<void> {
  await fs.mkdir(paths.contextDir(), { recursive: true });
  await fs.mkdir(paths.specsDir(), { recursive: true });
}

async function writeIfAllowed(
  fs: any,
  filePath: string,
  content: string,
  regenerate: boolean,
): Promise<{ written: boolean; skipped: boolean }> {
  const exists = await fileExists(fs, filePath);
  if (exists && !regenerate) {
    return { written: false, skipped: true };
  }
  if (exists && regenerate) {
    const backupPath = createBackupPath(filePath);
    const original = await fs.readFile(filePath);
    await fs.writeFile(backupPath, original);
  }
  await fs.writeFile(filePath, content);
  return { written: true, skipped: false };
}

async function loadConfig(fs: any): Promise<NarukanaConfig | null> {
  try {
    if (!(await fileExists(fs, paths.narukanaJson()))) return null;
    const raw = await fs.readFile(paths.narukanaJson());
    const parsed = JSON.parse(raw);
    return isValidConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function buildInventory(
  config: NarukanaConfig | null,
  worktreeRoot: string,
  uiResult: { ok: boolean; data?: CodebaseInventory["ui"]; error?: string },
  backendResult: { ok: boolean; data?: CodebaseInventory["backend"]; error?: string },
  contractResult: { ok: boolean; data?: CodebaseInventory["contract"]; error?: string },
  integrationMappings: CodebaseInventory["integration"]["mappings"],
): CodebaseInventory {
  const inventory: CodebaseInventory = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: getTimestamp(),
    sourceRoots: {
      ui: config?.paths.uiRoot || "root",
      contract: config?.paths.contractRoot || "root",
    },
    ui: uiResult.data ?? { framework: "unknown", pages: [], components: [], apiCalls: [] },
    backend: backendResult.data ?? { runtime: "unknown", routes: [], middleware: [] },
    contract: contractResult.data ?? { language: "unknown", contracts: [] },
    integration: { mappings: integrationMappings },
    suggestedSpecs: {
      context: "",
      ui: "",
      contract: {},
      contractDetail: "",
      integration: "",
    },
  };

  inventory.suggestedSpecs = {
    context: generateContextMarkdown(inventory),
    ui: generateUiSpec(inventory),
    contract: generateContractJson(inventory),
    contractDetail: generateContractDetail(inventory),
    integration: generateIntegrationSpec(inventory),
  };

  return inventory;
}

export const narukanaSpecFromCodebaseCreate = tool({
  description: "Scan existing codebase and generate Narukana-compliant spec files",
  args: {
    write: tool.schema.boolean().optional().default(false),
    regenerate: tool.schema.boolean().optional().default(false),
  },
  execute: async (args, ctx) => {
    const fs = getNarukanaFs(ctx.worktree);
    const write = args.write ?? false;
    const regenerate = args.regenerate ?? false;
    const worktreeRoot = ctx.worktree;
    const errors: string[] = [];

    const config = await loadConfig(fs);
    const uiRoot = config?.paths.uiRoot
      ? (config.paths.uiRoot.startsWith("/") ? config.paths.uiRoot : `${worktreeRoot}/${config.paths.uiRoot}`)
      : worktreeRoot;
    const contractRoot = config?.paths.contractRoot
      ? (config.paths.contractRoot.startsWith("/") ? config.paths.contractRoot : `${worktreeRoot}/${config.paths.contractRoot}`)
      : worktreeRoot;
    const backendRoot = worktreeRoot;

    let uiResult: { ok: boolean; data?: CodebaseInventory["ui"]; error?: string } = {
      ok: false,
      error: "Not scanned",
    };
    let backendResult: { ok: boolean; data?: CodebaseInventory["backend"]; error?: string } = {
      ok: false,
      error: "Not scanned",
    };
    let contractResult: { ok: boolean; data?: CodebaseInventory["contract"]; error?: string } = {
      ok: false,
      error: "Not scanned",
    };

    try {
      uiResult.data = await scanUI(fs, uiRoot);
      uiResult.ok = true;
    } catch (e: any) {
      uiResult.error = e.message;
      errors.push(`UI scan failed: ${e.message}`);
    }

    try {
      backendResult.data = await scanBackend(fs, backendRoot);
      backendResult.ok = true;
    } catch (e: any) {
      backendResult.error = e.message;
      errors.push(`Backend scan failed: ${e.message}`);
    }

    try {
      contractResult.data = await scanContract(fs, contractRoot);
      contractResult.ok = true;
    } catch (e: any) {
      contractResult.error = e.message;
      errors.push(`Contract scan failed: ${e.message}`);
    }

    const integrationMappings = mapIntegration(
      uiResult.data ?? { framework: "unknown", pages: [], components: [], apiCalls: [] },
      backendResult.data ?? { runtime: "unknown", routes: [], middleware: [] },
      contractResult.data ?? { language: "unknown", contracts: [] },
    );

    const inventory = buildInventory(
      config,
      worktreeRoot,
      uiResult,
      backendResult,
      contractResult,
      integrationMappings,
    );

    if (!write) {
      return JSON.stringify(
        {
          inventory,
          scanStatus: {
            ui: uiResult.ok ? "ok" : uiResult.error,
            backend: backendResult.ok ? "ok" : backendResult.error,
            contract: contractResult.ok ? "ok" : contractResult.error,
          },
        },
        null,
        2,
      );
    }

    await ensureNarukanaWorkspace(fs);

    const writeResults: string[] = [];
    const skipResults: string[] = [];

    const filesToWrite: Record<string, string> = {
      [`${paths.contextDir()}/context.md`]: inventory.suggestedSpecs.context,
      [paths.uiSpec()]: inventory.suggestedSpecs.ui,
      [paths.contractJson()]: JSON.stringify(inventory.suggestedSpecs.contract, null, 2),
      [paths.contractDetail()]: inventory.suggestedSpecs.contractDetail,
      [paths.integration()]: inventory.suggestedSpecs.integration,
      [`${paths.contextDir()}/techstack.md`]: generateTechstackMd(inventory),
      [`${paths.contextDir()}/architecture.md`]: generateArchitectureMd(inventory),
      [`${paths.contextDir()}/project.md`]: generateProjectMd(inventory),
    };

    for (const [filePath, content] of Object.entries(filesToWrite)) {
      const result = await writeIfAllowed(fs, filePath, content, regenerate);
      if (result.written) writeResults.push(filePath);
      if (result.skipped) skipResults.push(filePath);
    }

    const inventoryPath = paths.codebaseInventory();
    await fs.writeFile(inventoryPath, JSON.stringify(inventory, null, 2));
    writeResults.push(inventoryPath);

    let summary = `Codebase scan complete.\n\n`;
    summary += `UI: ${uiResult.ok ? `${inventory.ui.components.length} components, ${inventory.ui.pages.length} pages, ${inventory.ui.apiCalls.length} API calls` : `FAILED - ${uiResult.error}`}\n`;
    summary += `Backend: ${backendResult.ok ? `${inventory.backend.routes.length} routes, ${inventory.backend.runtime}` : `FAILED - ${backendResult.error}`}\n`;
    summary += `Contract: ${contractResult.ok ? `${inventory.contract.contracts.length} contracts, ${inventory.contract.language}` : `FAILED - ${contractResult.error}`}\n`;
    summary += `Integration: ${inventory.integration.mappings.length} mappings\n\n`;
    summary += `Files written:\n${writeResults.map((f) => `  - ${f}`).join("\n")}\n`;
    if (skipResults.length > 0) {
      summary += `\nFiles skipped (exist, use regenerate:true):\n${skipResults.map((f) => `  - ${f}`).join("\n")}\n`;
    }
    if (errors.length > 0) {
      summary += `\nWarnings:\n${errors.map((e) => `  - ${e}`).join("\n")}\n`;
    }

    return summary;
  },
});

export default narukanaSpecFromCodebaseCreate;