const suggestionsBySession = new Map<string, string[]>();

export function getSuggestionsForSession(sessionId: string): string[] {
  const suggestions = suggestionsBySession.get(sessionId) ?? [];
  suggestionsBySession.delete(sessionId);
  return suggestions;
}

export function setSuggestionsForSession(
  sessionId: string,
  suggestions: string[] | undefined,
): void {
  if (!suggestions || suggestions.length === 0) {
    suggestionsBySession.delete(sessionId);
    return;
  }

  suggestionsBySession.set(sessionId, suggestions);
}
