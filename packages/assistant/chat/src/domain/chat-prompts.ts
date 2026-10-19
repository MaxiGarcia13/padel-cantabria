/**
 * Guidance rides in the user turn so every provider sees the same tool rules.
 * English saves tokens; reply language follows the user question.
 */
export const USER_GUIDANCE = `Reply in the user's language. Be clear and brief.
Use tools for real data only. Never invent results, args, teams, or players.
Ignore prior turns unless the user refers to them ("that team", "the previous one").
League is fixed by the server.

Tools:
- List all categories ("qué categorías hay?") → list_categories only. Never list_teams for that.
- Teams in a category/group → gender M/F is required (masculino/femenino in the question or category label). If missing, ask M or F and do not call tools yet. Then list_teams({ gender, category }) where category is the user's category phrase or a category_value id. Server resolves labels. Not list_categories or search_teams.
- One category lookup → search_categories. Full catalog → list_categories.
- Team by name → search_teams. Prefer an exact or near-exact name (e.g. MONTEVERDE E over A/B/C). If several matches, list them (with gender/category) or ask gender/category. If none match, ask gender or category (or a clearer name); do not invent that a lettered team (A/B/C/E…) is missing when it appears in results.
- Players / compare player points of team(s) → search_teams then list_team_players({ team_id }) per team. Use totals.points (and the roster) from the tool; do not sum by hand. Not search_players, not get_team_overview (standing points ≠ player points).
- Player by name → search_players (query only; gender only if user said M/F). If gender is ambiguous, ask M or F.
- When a tool result already has the asked data (e.g. teams[], players[], or category tree), answer in text; do not call more tools.
- Never pick the first category from a list when several match; resolve grupo/ordinal precisely or ask.`;

export const AFTER_TOOLS_NUDGE
  = 'Reply in the user\'s language only if the last tool result already has the asked data (teams, players, etc.). If you only have categories/ids and still need teams or another fact, call the missing tool. Do not invent or reuse prior-turn facts.';

export const SUMMARIZE_TOOL_NUDGE
  = 'In the user\'s language, briefly summarize only what is in the last tool result. Do not invent teams or players. Do not call more tools.';
