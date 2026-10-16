# Padel Cantabria

Monorepo for scraping Federación Cántabra de Pádel data into Turso and serving it on the web.

## Packages

- [`packages/database`](packages/database) — schema, types, Turso client
- [`packages/scrapper`](packages/scrapper) — Puppeteer scrapers ([scripts & when to run them](packages/scrapper/README.md))
- [`packages/web`](packages/web) — Astro + Vue frontend

## Quick start

```bash
pnpm install
pnpm db:reset   # or `pnpm migrate` on an empty DB
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:calendar
pnpm dev
```

See [packages/scrapper/README.md](packages/scrapper/README.md) for env vars, script details, and when to re-run each scraper.
