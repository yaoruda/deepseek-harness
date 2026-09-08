/**
 * Connection-recovery plugin, node half. The browser contribution ships
 * through exports["./client"] and the node half keeps Loader composition
 * explicit without adding Host behavior.
 */

/** Host plugin body; connection recovery is browser-only. */
export function apply(): void {}
