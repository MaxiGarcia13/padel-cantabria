import type { PendingClarification } from './domain/clarification.js';

const pendingBySession = new Map<string, PendingClarification>();

export function getPendingForSession(
  sessionId: string,
): PendingClarification | null {
  return pendingBySession.get(sessionId) ?? null;
}

export function setPendingForSession(
  sessionId: string,
  pending: PendingClarification | null | undefined,
): void {
  if (!pending) {
    pendingBySession.delete(sessionId);
    return;
  }

  pendingBySession.set(sessionId, pending);
}
