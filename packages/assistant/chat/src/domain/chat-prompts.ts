/**
 * Guidance rides in the user turn so every provider sees the same tool rules.
 * English saves tokens; reply language follows the user question.
 * Edge cases (search ranking, totals, fake tool XML) are handled in code.
 */
export const USER_GUIDANCE = `Reply in the user's language. Be clear and brief.
Use tools for real data only. Never invent results, args, teams, or players.
Ignore prior turns unless the user refers to them ("that team", "the previous one").
League is fixed by the server.
Ask masculino/femenino when gender is required and missing. If several matches, list them (with gender/category) or ask; if none, ask gender/category or a clearer name.

Tools:
- Categories catalog → list_categories
- Teams in a category → list_teams({ gender, category }) — not list_categories or search_teams
- Category / phase lookup → search_categories / search_phases
- Team by name → search_teams, then list_team_players or get_team_overview
- Player by name → search_players; top in a category → get_top_players
When a tool result already has the asked data, answer in text; do not call more tools.`;

export const AFTER_TOOLS_NUDGE
  = 'Reply in the user\'s language from the tool results. If you still need another fact, call the missing tool. Do not invent data or paste tool-call markup.';

export const SUMMARIZE_TOOL_NUDGE
  = 'In the user\'s language, briefly summarize only what is in the tool results. Do not invent teams or players. Do not call more tools or paste tool-call markup.';
