# @padel-cantabria/scrapper

Puppeteer scrapers that load Federación Cántabra de Pádel data into Turso.

## Prerequisites

Root `.env` (repo root):

```env
TURSO_URL=...
TURSO_AUTH_TOKEN=...
```

Optional filters and politeness settings:

```env
# Limit scrapers (and web team search) to specific leagues; assistant/MCP require this
LEAGUE_IDS=28942


# Players + results: limit to federation gender values (same strings as teams.gender)
SCRAPE_GENDERS=M

# Delay in ms between federation page requests (default 1500)
SCRAPE_DELAY_MS=1500
```

`SCRAPE_DELAY_MS` applies to teams, players, calendar, and results scrapers. `SCRAPE_GENDERS` applies to `scrape:players` and `scrape:results` (empty = all genders).

Apply the schema first (from repo root):

```bash
pnpm db:migrate
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
| `pnpm scrape:teams`    | Scrapes teams per category (`Liga_ListadoEquipos`) | After leagues exist; before calendar/players |
| `pnpm scrape:players`  | Scrapes team rosters (`Liga_DetalleEquipo`)        | After teams exist                            |
| `pnpm scrape:calendar` | Scrapes matches and links them to team IDs         | After teams exist                            |
| `pnpm scrape:results`  | Scrapes recent played results (`Liga_Resultado`)   | After calendar; current/previous weekend     |

## Full sync (first time or after schema recreate)

```bash
pnpm db:reset   # or `pnpm db:migrate` on an empty DB
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:players
pnpm scrape:calendar
pnpm scrape:results
```

## When to re-run individual scrapers

1. **`scrape:leagues`** — categories/phases/genders missing or outdated. Needed before teams/calendar can see new groups. Note: existing leagues in the DB are skipped on upsert.
2. **`scrape:teams`** — team list changed (inscriptions, names, confirmed status). Required before calendar/players if new teams appeared.
3. **`scrape:players`** — roster ranking/points updates. Re-runs keep `previous_position` / `previous_points` from the last scrape.
4. **`scrape:calendar`** — match dates/results/schedule updates. Resolves home/away team names to IDs in memory; fails if a team was not scraped yet.
5. **`scrape:results`** — lineups and scores for matches already played in the current or previous weekend. Skips pages that are not ready yet. Respects `SCRAPE_GENDERS` so you can split M/F runs (same as players).

Typical refresh when only fixtures changed:

```bash
pnpm scrape:teams
pnpm scrape:calendar
SCRAPE_GENDERS=M pnpm scrape:results
SCRAPE_GENDERS=F pnpm scrape:results
```

## GitHub Actions schedule

Scheduled workflows stagger load on the federation site:

| Workflow              | When (UTC)      | Scope                                 |
| --------------------- | --------------- | ------------------------------------- |
| `scrape-players.yml`  | Tuesday 04:00   | Masculine (`SCRAPE_GENDERS_TUESDAY`)  |
| `scrape-calendar.yml` | Tuesday 05:00   | All categories                        |
| `scrape-players.yml`  | Wednesday 04:00 | Feminine (`SCRAPE_GENDERS_WEDNESDAY`) |

Set these **repository variables** in GitHub Actions (exact federation gender values from Turso / `#genero`):

- `SCRAPE_GENDERS_TUESDAY` — masculine gender value(s), comma-separated if needed
- `SCRAPE_GENDERS_WEDNESDAY` — feminine gender value(s)
- `LEAGUE_IDS` — optional, same as local `.env`

Manual `workflow_dispatch` on players accepts an optional `genders` input (empty = all). Inter-request delay uses the scraper default unless `SCRAPE_DELAY_MS` is passed via prepare-scrape.
