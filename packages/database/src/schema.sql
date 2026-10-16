PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS genders (
  league_id INTEGER NOT NULL REFERENCES leagues (id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (league_id, value)
);

CREATE TABLE IF NOT EXISTS phases (
  league_id INTEGER NOT NULL,
  gender TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (league_id, gender, value),
  FOREIGN KEY (league_id, gender) REFERENCES genders (league_id, value) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  league_id INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phase TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (league_id, gender, phase, value),
  FOREIGN KEY (league_id, gender, phase) REFERENCES phases (league_id, gender, value) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  league_id INTEGER NOT NULL REFERENCES leagues (id) ON DELETE CASCADE,
  gender TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (league_id, gender, category, name)
);

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
  schedule TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (league_id, gender, phase, category, id),
  FOREIGN KEY (league_id, gender, phase, category)
    REFERENCES categories (league_id, gender, phase, value)
    ON DELETE CASCADE
);
