import { createHash } from "crypto";

export function hashString(input: string): string {
  const hash = createHash("sha256");
  hash.update(input);
  return hash.digest("hex").substring(0, 16);
}

export function hashFileContent(content: string): string {
  return hashString(content);
}

export function computePlanId(planContent: string): string {
  return hashFileContent(planContent);
}
