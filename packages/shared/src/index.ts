export {
  categoryAliasKey,
  normalizeCategoryQuery,
  normalizeCategoryToken,
} from './category/index.js';
export { formatNumber } from './format/index.js';
export { inferGenderFromText, normalizeGender } from './gender/index.js';
export {
  formatMatchMeta,
  formatMatchMetaParts,
  getActiveWeekendRange,
  getClosestMatches,
  getMatchSortTime,
  getWeekendRangeContaining,
  groupMatchesByDate,
  type MatchDateGroup,
  type MatchDateRange,
  parseMatchDateRange,
  type SeasonRange,
  sortMatchesByDate,
  type WeekendRange,
} from './matches/index.js';
export {
  formatStandingValue,
  getPositionTrend,
  type PositionTrend,
} from './standings/index.js';
export {
  type CompetitionKey,
  type CompetitionLabels,
  findLeagueGender,
  getPhaseOptions,
  getTeamDisplayLabels,
  getTeamTotalPoints,
  loadTeamStandingAndNextMatch,
  resolveCompetitionLabels,
  type TeamDisplayLabels,
  type TeamStandingAndNextMatch,
} from './team/index.js';

export { foldText } from './text/index.js';
