import { createHash } from "crypto";
export function hashString(input) {
    const hash = createHash("sha256");
    hash.update(input);
    return hash.digest("hex").substring(0, 16);
}
export function hashFileContent(content) {
    return hashString(content);
}
export function computePlanId(planContent) {
    return hashFileContent(planContent);
}
//# sourceMappingURL=hashing.js.map