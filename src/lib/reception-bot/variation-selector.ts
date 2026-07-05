/**
 * Deterministic variant picker.
 * Uses sessionId + turn to select a variant index so the same session
 * always gets the same variant for a given turn.
 */
export function pickVariant<T>(variants: T[], sessionId: string, turn: number): T {
  // Simple hash: sum char codes of sessionId, xor with turn
  let hash = turn;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) >>> 0;
  }
  return variants[hash % variants.length];
}
