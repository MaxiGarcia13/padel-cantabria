# @padel-cantabria/scrapper

Puppeteer scrapers that load Federación Cántabra de Pádel data into Turso.

## Prerequisites

Root `.env` (repo root):

```env
TURSO_URL=...
TURSO_AUTH_TOKEN=...
```

Optional: limit scrapers to specific leagues (comma-separated federation IDs):

```env
LEAGUE_IDS=28942
```

Apply the schema first (from repo root):

```bash
pnpm migrate
```

`migrate` only runs `CREATE TABLE IF NOT EXISTS`. It does **not** rename columns or migrate old data. After a breaking schema change, wipe and recreate:

```bash
pnpm db:reset
```

Then re-run the full scrape sync below.

## Scripts

Run from the **repo root**. Order matters: each step depends on data from the previous one.

| Script                 | What it does                                       | When to run                                  |
| ---------------------- | -------------------------------------------------- | -------------------------------------------- |
| `pnpm scrape:leagues`  | Scrapes leagues, genders, phases, and categories   | First sync, or when league structure changes |
| `pnpm scrape:teams`    | Scrapes teams per category (`Liga_ListadoEquipos`) | After leagues exist; before calendar         |
| `pnpm scrape:calendar` | Scrapes matches and links them to team IDs         | After teams exist                            |

## Full sync (first time or after schema recreate)

```bash
pnpm db:reset   # or `pnpm migrate` on an empty DB
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:calendar
```

## When to re-run individual scrapers

1. **`scrape:leagues`** — categories/phases/genders missing or outdated. Needed before teams/calendar can see new groups. Note: existing leagues in the DB are skipped on upsert.
2. **`scrape:teams`** — team list changed (inscriptions, names, confirmed status). Required before calendar if new teams appeared.
3. **`scrape:calendar`** — match dates/results/schedule updates. Resolves home/away team names to IDs in memory; fails if a team was not scraped yet.

Typical refresh when only fixtures changed:

```bash
pnpm scrape:teams
pnpm scrape:calendar
```
