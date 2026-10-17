# Padel Cantabria

A clearer way to follow **teams, matches, and stats** from the Liga de Pádel de Cantabria.

The official source of truth is the
[Federación Cántabra de Pádel](https://federacioncantabradepadel.com) website.
This project does **not** replace it and is **not** affiliated with the federation.
It only aims to improve how that public information is viewed — clearer layout,
stats, and calendars.

## Official website

→ [federacioncantabradepadel.com](https://federacioncantabradepadel.com)

## What you can do here

- See leagues, teams, and match calendars in a more readable UI
- Follow team results and related stats without fighting the original site’s layout

## Where the data comes from

Data is copied automatically from the Federación Cántabra de Pádel website (a “scraper”: a script that reads public pages and stores the useful bits in a database so the web app can show them nicely).

This project does **not** invent results. It re-presents public federation data.

For how scraping works, which scripts to run, and when to refresh data, see:

→ [packages/scrapper/README.md](packages/scrapper/README.md)

## For developers

Monorepo: scrape federation data into Turso and serve it on the web.

### Packages

- [`packages/database`](packages/database) — schema, types, Turso client
- [`packages/scrapper`](packages/scrapper) — Puppeteer scrapers ([scripts & when to run them](packages/scrapper/README.md))
- [`packages/web`](packages/web) — Astro + Vue frontend

### Quick start

```bash
pnpm install
pnpm db:reset   # or `pnpm migrate` on an empty DB
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:players
pnpm scrape:calendar
pnpm dev
```

See [packages/scrapper/README.md](packages/scrapper/README.md) for env vars, script details, and when to re-run each scraper.
