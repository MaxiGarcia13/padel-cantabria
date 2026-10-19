/**
 * Hermes function-calling injects its own system prompt; a custom `system`
 * message is rejected when `tools` is set. Keep guidance in the user turn.
 * English saves tokens; reply language follows the user question.
 */
export const USER_GUIDANCE = `Reply in the user's language. Be clear and brief.
Use tools for real data only. Never invent results, args, teams, or players.
Ignore prior turns unless the user refers to them ("that team", "the previous one").
League is fixed by the server.

Tools:
- List all categories ("qué categorías hay?") → list_categories only. Never list_teams for that.
- Teams in a category/group → gender M/F is required. If the user did not say masculino/femenino, ask M or F and do not call tools yet. Then search_categories + list_teams with category_value + gender. Not list_categories or search_teams.
- One category lookup → search_categories. Full catalog → list_categories.
- Team by name → search_teams. Player by name → search_players (query only; gender only if user said M/F). If gender is ambiguous, ask M or F.
- When a tool result already has the asked data (e.g. teams[] or category tree), answer in text; do not call more tools.
- Never pick the first category from a list when several match; resolve grupo/ordinal precisely or ask.`;

export const AFTER_TOOLS_NUDGE
  = 'Reply in the user\'s language only if the last tool result already has the asked data (teams, players, etc.). If you only have categories/ids and still need teams or another fact, call the missing tool. Do not invent or reuse prior-turn facts.';

export const SUMMARIZE_TOOL_NUDGE
  = 'In the user\'s language, briefly summarize only what is in the last tool result. Do not invent teams or players. Do not call more tools.';
