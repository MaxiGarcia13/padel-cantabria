CREATE TABLE IF NOT EXISTS match_results (
  league_id INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,
  match_id INTEGER NOT NULL,
  round INTEGER,
  played_at TEXT,
  location TEXT,
  rounds_order TEXT,
  home_games INTEGER,
  home_sets INTEGER,
  home_matches INTEGER,
  away_matches INTEGER,
  away_sets INTEGER,
  away_games INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (league_id, gender, phase, category, match_id),
  FOREIGN KEY (league_id, gender, phase, category, match_id)
    REFERENCES matches (league_id, gender, phase, category, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS match_games (
  league_id INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,
  match_id INTEGER NOT NULL,
  game_number INTEGER NOT NULL,
  home_pair_points INTEGER,
  away_pair_points INTEGER,
  home_sets INTEGER,
  away_sets INTEGER,
  partials TEXT,
  home_player_1 TEXT NOT NULL,
  home_player_1_points INTEGER,
  home_player_2 TEXT NOT NULL,
  home_player_2_points INTEGER,
  away_player_1 TEXT NOT NULL,
  away_player_1_points INTEGER,
  away_player_2 TEXT NOT NULL,
  away_player_2_points INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (league_id, gender, phase, category, match_id, game_number),
  FOREIGN KEY (league_id, gender, phase, category, match_id)
    REFERENCES match_results (league_id, gender, phase, category, match_id)
    ON DELETE CASCADE
);
