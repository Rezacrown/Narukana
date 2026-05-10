import { createRuntimeFs } from "./runtimeFs";
import { WORKSPACE_DIR } from "./constants";
export function getNarukanaFs(worktreeRoot) {
    return createRuntimeFs(worktreeRoot);
}
export function withWorkspacePath(relPath) {
    return `${WORKSPACE_DIR}/${relPath}`;
}
//# sourceMappingURL=narukanaFs.js.map