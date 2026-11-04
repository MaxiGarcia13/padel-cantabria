import { isRecord, parseToolJson } from '@chat/utils/parse-tool-json.js';
import { foldText } from '@padel-cantabria/shared';
import { isLeagueTree } from './tool-result-fallback/is-league-tree.js';
import {
  isPresentedCategory,
  isPresentedCategoryTeams,
  isPresentedPlayerLike,
  isPresentedStandingTeam,
  isPresentedTeamRoster,
} from './tool-result-fallback/is-presented.js';

const MAX_FOLLOW_UPS = 3;

function pushUnique(suggestions: string[], prompt: string, userMessage: string) {
  const trimmed = prompt.trim();
  if (!trimmed || suggestions.length >= MAX_FOLLOW_UPS) {
    return;
  }

  const folded = foldText(trimmed);
  if (foldText(userMessage) === folded) {
    return;
  }

  if (suggestions.some((entry) => foldText(entry) === folded)) {
    return;
  }

  suggestions.push(trimmed);
}

function categoryTeamsPrompt(category: string, gender?: string): string {
  const genderPart = gender?.trim()
    ? ` ${gender.trim().toLowerCase()}`
    : '';
  return `¿Qué equipos hay en ${category.trim()}${genderPart}?`;
}

function suggestionsFromLeagueTree(
  leagues: unknown[],
  userMessage: string,
  suggestions: string[],
) {
  for (const leagueEntry of leagues) {
    if (!isRecord(leagueEntry) || !Array.isArray(leagueEntry.genders)) {
      continue;
    }

    for (const genderEntry of leagueEntry.genders) {
      if (!isRecord(genderEntry) || !Array.isArray(genderEntry.phases)) {
        continue;
      }

      const gender
        = typeof genderEntry.gender === 'string'
          ? genderEntry.gender
          : typeof genderEntry.gender_code === 'string'
            ? genderEntry.gender_code
            : '';

      for (const phaseEntry of genderEntry.phases) {
        if (!isRecord(phaseEntry) || !Array.isArray(phaseEntry.categories)) {
          continue;
        }

        for (const categoryEntry of phaseEntry.categories) {
          if (!isRecord(categoryEntry)) {
            continue;
          }

          const category
            = typeof categoryEntry.category === 'string'
              ? categoryEntry.category
              : '';
          if (!category) {
            continue;
          }

          pushUnique(
            suggestions,
            categoryTeamsPrompt(category, gender),
            userMessage,
          );
          if (suggestions.length >= MAX_FOLLOW_UPS) {
            return;
          }
        }
      }
    }
  }
}

function isTeamOverview(value: unknown): value is {
  team: {
    name: string;
    category?: string;
    gender?: string;
  };
} {
  return isRecord(value)
    && isRecord(value.team)
    && typeof value.team.name === 'string'
    && (
      'standing' in value
      || 'next_match' in value
      || 'phases' in value
    );
}

function suggestionsFromPayload(
  parsed: unknown,
  userMessage: string,
  suggestions: string[],
) {
  if (isPresentedTeamRoster(parsed)) {
    const name = parsed.team.name;
    pushUnique(suggestions, `¿Cuál es la posición de ${name}?`, userMessage);
    pushUnique(suggestions, `¿Cuándo juega ${name}?`, userMessage);
    if (typeof parsed.team.category === 'string' && parsed.team.category) {
      pushUnique(
        suggestions,
        categoryTeamsPrompt(
          parsed.team.category,
          typeof parsed.team.gender === 'string'
            ? parsed.team.gender
            : undefined,
        ),
        userMessage,
      );
    }
    return;
  }

  if (isTeamOverview(parsed)) {
    const name = parsed.team.name;
    pushUnique(suggestions, `¿Qué jugadores hay en ${name}?`, userMessage);
    pushUnique(suggestions, `¿Cuándo juega ${name}?`, userMessage);
    if (typeof parsed.team.category === 'string' && parsed.team.category) {
      pushUnique(
        suggestions,
        categoryTeamsPrompt(
          parsed.team.category,
          typeof parsed.team.gender === 'string'
            ? parsed.team.gender
            : undefined,
        ),
        userMessage,
      );
    }
    return;
  }

  if (isPresentedCategoryTeams(parsed)) {
    const firstTeam = parsed.teams.find(isPresentedStandingTeam);
    if (firstTeam) {
      pushUnique(
        suggestions,
        `¿Qué jugadores hay en ${firstTeam.name}?`,
        userMessage,
      );
      pushUnique(
        suggestions,
        `¿Cuál es la posición de ${firstTeam.name}?`,
        userMessage,
      );
      pushUnique(
        suggestions,
        `¿Cuándo juega ${firstTeam.name}?`,
        userMessage,
      );
    }
    return;
  }

  if (isPresentedStandingTeam(parsed)) {
    pushUnique(
      suggestions,
      `¿Qué jugadores hay en ${parsed.name}?`,
      userMessage,
    );
    pushUnique(suggestions, `¿Cuándo juega ${parsed.name}?`, userMessage);
    return;
  }

  if (isPresentedPlayerLike(parsed)) {
    const team = 'team' in parsed && typeof parsed.team === 'string'
      ? parsed.team
      : '';
    if (team) {
      pushUnique(suggestions, `¿Qué jugadores hay en ${team}?`, userMessage);
      pushUnique(suggestions, `¿Cuál es la posición de ${team}?`, userMessage);
    }
    return;
  }

  if (isPresentedCategory(parsed)) {
    pushUnique(
      suggestions,
      categoryTeamsPrompt(
        parsed.category,
        typeof parsed.gender === 'string'
          ? parsed.gender
          : undefined,
      ),
      userMessage,
    );
    return;
  }

  if (isLeagueTree(parsed)) {
    suggestionsFromLeagueTree(parsed, userMessage, suggestions);
    return;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return;
  }

  if (parsed.every(isPresentedStandingTeam)) {
    const team = parsed[0]!;
    pushUnique(suggestions, `¿Qué jugadores hay en ${team.name}?`, userMessage);
    pushUnique(suggestions, `¿Cuál es la posición de ${team.name}?`, userMessage);
    pushUnique(suggestions, `¿Cuándo juega ${team.name}?`, userMessage);
    return;
  }

  if (parsed.every(isPresentedPlayerLike)) {
    suggestionsFromPayload(parsed[0], userMessage, suggestions);
    return;
  }

  if (parsed.every(isPresentedCategory)) {
    for (const category of parsed) {
      suggestionsFromPayload(category, userMessage, suggestions);
      if (suggestions.length >= MAX_FOLLOW_UPS) {
        return;
      }
    }
  }
}

export function buildFollowUpSuggestions(options: {
  toolResults: string[];
  userMessage: string;
}): string[] {
  const suggestions: string[] = [];

  for (let index = options.toolResults.length - 1; index >= 0; index -= 1) {
    const parsed = parseToolJson(options.toolResults[index]!);
    if (parsed === null) {
      continue;
    }

    suggestionsFromPayload(parsed, options.userMessage, suggestions);
    if (suggestions.length >= MAX_FOLLOW_UPS) {
      break;
    }
  }

  return suggestions.slice(0, MAX_FOLLOW_UPS);
}
