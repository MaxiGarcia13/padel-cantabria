CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  league_id INTEGER NOT NULL REFERENCES leagues (id) ON DELETE CASCADE,
  gender TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (league_id, gender, category, name)
);

CREATE TABLE IF NOT EXISTS team_standings (
  league_id INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,
  team_id INTEGER NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  position INTEGER,
  previous_position INTEGER,
  confrontations_played INTEGER,
  points INTEGER,
  matches_played INTEGER,
  matches_won INTEGER,
  sets_for INTEGER,
  sets_against INTEGER,
  sets_average INTEGER,
  games_for INTEGER,
  games_against INTEGER,
  games_average INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (league_id, gender, phase, category, team_id),
  FOREIGN KEY (league_id, gender, phase, category)
    REFERENCES categories (league_id, gender, phase, value)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_players (
  team_id INTEGER NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  previous_position INTEGER,
  surname TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  previous_points INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (team_id, surname, name)
);
