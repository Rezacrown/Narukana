import { createRuntimeFs, type RuntimeFs } from "./runtimeFs";
import { WORKSPACE_DIR } from "./constants";

export function getNarukanaFs(worktreeRoot: string): RuntimeFs {
  return createRuntimeFs(worktreeRoot);
}

export function withWorkspacePath(relPath: string): string {
  return `${WORKSPACE_DIR}/${relPath}`;
}
