import { z } from 'zod';
import {
  CATEGORY_ARG,
  GENDER_OPTIONAL,
  GENDER_REQUIRED,
  LIMIT_OPTIONAL,
  PHASE_OPTIONAL,
  TEAM_ID,
} from './schemas.js';

export const MCP_TOOLS = {
  list_categories: {
    description:
      'List the full leagues tree with genders, phases, and categories. Prefer search_categories / search_phases for targeted lookup. Do not use to answer which teams are in a category (use list_teams). League is fixed by server config.',
  },
  search_categories: {
    description:
      'Search categories by independent tokens (e.g. "3ª"). League is fixed by server config. May return several matches. Do not invent gender.',
    inputSchema: {
      query: z.string().optional().describe('Category search tokens'),
      gender: GENDER_OPTIONAL,
      limit: LIMIT_OPTIONAL,
    },
  },
  search_phases: {
    description:
      'Search competition phases by independent tokens. League is fixed by server config. Use when the user asks about a phase or before standings/next match if phase is unclear.',
    inputSchema: {
      query: z.string().optional().describe('Phase search tokens'),
      gender: GENDER_OPTIONAL,
      limit: LIMIT_OPTIONAL,
    },
  },
  list_teams: {
    description:
      'List teams (and standings) in a category/group. Use when the user asks which teams are in a category. Requires gender M/F and category (free-text phrase or category_value id; server resolves). Optional phase (phase_value; defaults to the category phase). Do not use list_categories or search_teams for this.',
    inputSchema: {
      gender: GENDER_REQUIRED,
      category: CATEGORY_ARG,
      phase: PHASE_OPTIONAL,
    },
  },
  search_teams: {
    description:
      'Search teams by name. League fixed by server. Returns id, name, gender/category labels. For teams in a category use list_teams.',
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe('One or more words from the team name'),
      limit: LIMIT_OPTIONAL,
    },
  },
  get_team_overview: {
    description:
      'Team standing/position and next match for a phase. Use search_phases if phase is unknown. Pass phase_value from search_phases when needed. Does not return the roster; use list_team_players for that.',
    inputSchema: {
      team_id: TEAM_ID,
      phase: z
        .string()
        .optional()
        .describe(
          'Phase value (phase_value from search_phases); defaults to the first available phase',
        ),
    },
  },
  list_team_players: {
    description:
      'Roster and player-point totals for one team (team_id from search_teams). Call once per team to compare. Not standings (get_team_overview) or search_players.',
    inputSchema: {
      team_id: TEAM_ID,
    },
  },
  search_players: {
    description:
      'Search players by name/surname only. League is fixed by server config. Returns team, league, gender and category labels, points. Call with query only unless the user named a gender. If several genders match, ask masculino (M) or femenino (F).',
    inputSchema: {
      query: z
        .string()
        .describe(
          'Player name words only (e.g. "Maximiliano Garcia Mortigliengo")',
        ),
      gender: GENDER_OPTIONAL,
      limit: LIMIT_OPTIONAL,
    },
  },
  get_top_players: {
    description:
      'Top points in a category. League is fixed by server config. Requires category (free-text phrase or category_value id) and gender M/F. Ask the user if unknown.',
    inputSchema: {
      gender: GENDER_REQUIRED,
      category: CATEGORY_ARG,
      limit: LIMIT_OPTIONAL,
    },
  },
} as const;
