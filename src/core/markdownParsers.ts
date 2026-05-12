import { NARUKANA_UI_ACTIONS_START, NARUKANA_UI_ACTIONS_END } from "./constants";

export function parseUIActions(content: string): string[] {
  const actions: string[] = [];
  const startIdx = content.indexOf(NARUKANA_UI_ACTIONS_START);
  const endIdx = content.indexOf(NARUKANA_UI_ACTIONS_END);
  if (startIdx === -1 || endIdx === -1) return actions;

  const block = content.substring(
    startIdx + NARUKANA_UI_ACTIONS_START.length,
    endIdx,
  );
  for (const line of block.split("\n")) {
    const match = line.trim().match(/^- action:\s*(.+)$/);
    if (match) actions.push(match[1].trim());
  }
  return actions;
}

export function parseContractOperations(content: string): string[] {
  try {
    const data = JSON.parse(content);
    if (!data.operations || typeof data.operations !== "object") return [];
    return Object.keys(data.operations);
  } catch {
    return [];
  }
}

export interface IntegrationMapping {
  actions: string[];
  operations: string[];
  mappedOperations: string[];
  actionToOperations: Record<string, string[]>;
  hasMappingsSection: boolean;
}

export function parseIntegrationMappings(content: string): IntegrationMapping {
  const result: IntegrationMapping = {
    actions: [],
    operations: [],
    mappedOperations: [],
    actionToOperations: {},
    hasMappingsSection: false,
  };

  const mappingsMatch = content.match(/## Mappings\n([\s\S]*?)(?:\n##|$)/);
  if (mappingsMatch) {
    result.hasMappingsSection = true;
    const lines = mappingsMatch[1].split("\n");
    let currentAction = "";

    for (const line of lines) {
      const actionMatch = line.trim().match(/^- action:\s*(.+)$/);
      if (actionMatch) {
        currentAction = actionMatch[1].trim();
        if (!result.actions.includes(currentAction)) result.actions.push(currentAction);
        result.actionToOperations[currentAction] = result.actionToOperations[currentAction] || [];
      }

      const opMatch = line.trim().match(/^-\s+op:\s*(.+)$/);
      if (opMatch && currentAction) {
        const op = opMatch[1].trim();
        if (!result.operations.includes(op)) result.operations.push(op);
        if (!result.mappedOperations.includes(op)) result.mappedOperations.push(op);
        if (!result.actionToOperations[currentAction].includes(op)) {
          result.actionToOperations[currentAction].push(op);
        }
      }
    }
  }

  const opsMatch = content.match(/## Contract Operations\n([\s\S]*?)(?:\n##|$)/);
  if (opsMatch) {
    for (const line of opsMatch[1].split("\n")) {
      const match = line.trim().match(/^-\s+(.+)$/);
      if (match) {
        const op = match[1].trim();
        if (!result.operations.includes(op)) result.operations.push(op);
      }
    }
  }

  return result;
}