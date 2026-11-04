import { CHAT_SUGGESTIONS } from './chat-suggestions';

const STORAGE_KEY = 'padel-assistant-recent-questions';
const MAX_RECENT = 5;
const STARTER_COUNT = 3;

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function foldKey(value: string): string {
  return normalize(value).toLocaleLowerCase('es');
}

export function readRecentQuestions(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is string => typeof entry === 'string')
      .map(normalize)
      .filter(Boolean)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberQuestion(question: string): string[] {
  const trimmed = normalize(question);
  if (!trimmed) {
    return readRecentQuestions();
  }

  const key = foldKey(trimmed);
  const next = [
    trimmed,
    ...readRecentQuestions().filter((entry) => foldKey(entry) !== key),
  ].slice(0, MAX_RECENT);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function buildStarterSuggestions(
  recent: string[] = readRecentQuestions(),
): string[] {
  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (const entry of [
    ...recent,
    ...CHAT_SUGGESTIONS,
  ]) {
    const key = foldKey(entry);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    suggestions.push(normalize(entry));
    if (suggestions.length >= STARTER_COUNT) {
      break;
    }
  }

  return suggestions;
}
