CREATE TABLE IF NOT EXISTS matches (
  league_id INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,
  id INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL REFERENCES teams (id),
  away_team_id INTEGER NOT NULL REFERENCES teams (id),
  date TEXT NOT NULL,
  status TEXT,
  location TEXT,
  rounds TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (league_id, gender, phase, category, id),
  FOREIGN KEY (league_id, gender, phase, category)
    REFERENCES categories (league_id, gender, phase, value)
    ON DELETE CASCADE
);
