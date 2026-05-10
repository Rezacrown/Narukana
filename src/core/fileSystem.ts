import { basename, join } from "path";
import {
  WORKSPACE_DIR,
  NARUKANA_JSON,
  CONTEXT_DIR,
  SPECS_DIR,
  CONTEXT_FILE,
  IDEA_FILE,
  UI_SPEC_FILE,
  CONTRACT_JSON_FILE,
  CONTRACT_DETAIL_FILE,
  INTEGRATION_FILE,
  PLAN_FILE,
  TASKS_FILE,
} from "./constants";

export function getWorkspacePath(...segments: string[]): string {
  return join(WORKSPACE_DIR, ...segments);
}

export function getContextPath(file: string = ""): string {
  return getWorkspacePath(CONTEXT_DIR, file);
}

export function getSpecsPath(file: string = ""): string {
  return getWorkspacePath(SPECS_DIR, file);
}

export const paths = {
  workspace: () => WORKSPACE_DIR,
  narukanaJson: () => getWorkspacePath(NARUKANA_JSON),
  contextDir: () => getContextPath(),
  specsDir: () => getSpecsPath(),
  context: () => getContextPath(CONTEXT_FILE),
  idea: () => getContextPath(IDEA_FILE),
  uiSpec: () => getSpecsPath(UI_SPEC_FILE),
  contractJson: () => getSpecsPath(CONTRACT_JSON_FILE),
  contractDetail: () => getSpecsPath(CONTRACT_DETAIL_FILE),
  integration: () => getSpecsPath(INTEGRATION_FILE),
  plan: () => getWorkspacePath(PLAN_FILE),
  tasks: () => getWorkspacePath(TASKS_FILE),
};

export function getBasename(filePath: string): string {
  return basename(filePath);
}

export async function fileExists(fs: any, path: string): Promise<boolean> {
  try {
    const result = await fs.stat(path);
    return result !== undefined;
  } catch {
    return false;
  }
}

export async function readJsonFile(fs: any, path: string): Promise<any> {
  const content = await fs.readFile(path);
  return JSON.parse(content);
}

export async function writeJsonFile(
  fs: any,
  path: string,
  data: any,
): Promise<void> {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}

export function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function createBackupPath(originalPath: string): string {
  const timestamp = getTimestamp();
  return `${originalPath}.bak.${timestamp}`;
}
