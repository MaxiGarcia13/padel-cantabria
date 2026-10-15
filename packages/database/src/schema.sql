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
  gender_value TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (league_id, gender_value, value),
  FOREIGN KEY (league_id, gender_value) REFERENCES genders (league_id, value) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  league_id INTEGER NOT NULL,
  gender_value TEXT NOT NULL,
  phase_value TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (league_id, gender_value, phase_value, value),
  FOREIGN KEY (league_id, gender_value, phase_value) REFERENCES phases (league_id, gender_value, value) ON DELETE CASCADE
);
