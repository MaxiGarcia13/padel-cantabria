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
  getClosestMatches,
  getMatchSortTime,
  groupMatchesByDate,
  type MatchDateGroup,
  type MatchDateRange,
  parseMatchDateRange,
  type SeasonRange,
  sortMatchesByDate,
} from './matches/index.js';
export {
  formatStandingValue,
  getPositionTrend,
  type PositionTrend,
} from './standings/index.js';
export {
  getPhaseOptions,
  getTeamDisplayLabels,
  getTeamTotalPoints,
  type TeamDisplayLabels,
} from './team/index.js';
export { foldText } from './text/index.js';
