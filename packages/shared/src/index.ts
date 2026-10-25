export {
  categoryAliasKey,
  normalizeCategoryQuery,
  normalizeCategoryToken,
} from './category/index.js';
export { formatNumber } from './format/index.js';
export { inferGenderFromText, normalizeGender } from './gender/index.js';
export {
  attachPlayerMatchStats,
  computePlayerPageStats,
  computeTeamCoupleStats,
  formatMatchMeta,
  formatMatchMetaParts,
  formatWinAverage,
  getActiveWeekendRange,
  getClosestMatches,
  getMatchSortTime,
  getNextMatch,
  getWeekendRangeContaining,
  groupMatchesByDate,
  type MatchDateGroup,
  type MatchDateRange,
  type MatchResultSummary,
  type MatchWinnerSide,
  parseMatchDateRange,
  type PlayerCourtAppearance,
  type PlayerMatchStats,
  type PlayerPageStats,
  type PlayerPartnerStats,
  type PlayerSideSplit,
  type SeasonRange,
  sortMatchesByDate,
  summarizeMatchResult,
  type TeamCouplePlayer,
  type TeamCoupleStats,
  type TeamPlayerWithMatchStats,
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
