export const PLAYER_WITH_TEAM_SELECT_SQL = `
  SELECT
    team_players.team_id,
    team_players.position,
    team_players.previous_position,
    team_players.surname,
    team_players.name,
    team_players.points,
    team_players.previous_points,
    teams.name AS team_name,
    teams.league_id,
    leagues.name AS league_name,
    teams.gender,
    genders.label AS gender_label,
    teams.category,
    (
      SELECT categories.label
      FROM categories
      WHERE categories.league_id = teams.league_id
        AND categories.gender = teams.gender
        AND categories.value = teams.category
      LIMIT 1
    ) AS category_label
  FROM team_players
  INNER JOIN teams ON teams.id = team_players.team_id
  INNER JOIN leagues ON leagues.id = teams.league_id
  INNER JOIN genders
    ON genders.league_id = teams.league_id
    AND genders.value = teams.gender
`;
