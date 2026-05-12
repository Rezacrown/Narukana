import { basename, join } from "path";
import { WORKSPACE_DIR, NARUKANA_JSON, CONTEXT_DIR, SPECS_DIR, CONTEXT_FILE, IDEA_FILE, UI_SPEC_FILE, CONTRACT_JSON_FILE, CONTRACT_DETAIL_FILE, INTEGRATION_FILE, PLAN_FILE, TASKS_FILE, MEMORY_FILE, CODEBASE_INVENTORY_FILE, } from "./constants";
export function getWorkspacePath(...segments) {
    return join(WORKSPACE_DIR, ...segments);
}
export function getContextPath(file = "") {
    return getWorkspacePath(CONTEXT_DIR, file);
}
export function getSpecsPath(file = "") {
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
    memory: () => getWorkspacePath(MEMORY_FILE),
    codebaseInventory: () => getWorkspacePath(CODEBASE_INVENTORY_FILE),
};
export function getBasename(filePath) {
    return basename(filePath);
}
export async function fileExists(fs, path) {
    try {
        const result = await fs.stat(path);
        return result !== undefined;
    }
    catch {
        return false;
    }
}
export async function readJsonFile(fs, path) {
    const content = await fs.readFile(path);
    return JSON.parse(content);
}
export async function writeJsonFile(fs, path, data) {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
}
export function getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}
export function createBackupPath(originalPath) {
    const timestamp = getTimestamp();
    return `${originalPath}.bak.${timestamp}`;
}
//# sourceMappingURL=fileSystem.js.map