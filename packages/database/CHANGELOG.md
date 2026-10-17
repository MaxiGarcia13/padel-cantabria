## 0.0.3 (2026-10-17)

### 🚀 Features

- Update getMatchById function to include category parameter ([d282f3c](https://github.com/MaxiGarcia13/padel-cantabria/commit/d282f3c))
- Add getMatchById function to retrieve match details ([a1a49d0](https://github.com/MaxiGarcia13/padel-cantabria/commit/a1a49d0))

### 🔄 Refactors

- Remove unnecessary blank line in createClient function ([bdac34f](https://github.com/MaxiGarcia13/padel-cantabria/commit/bdac34f))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.2 (2026-10-17)

### 🧹 Chores

- Update AGENTS.md and pnpm-workspace.yaml for formatting consistency ([cdd853e](https://github.com/MaxiGarcia13/padel-cantabria/commit/cdd853e))
- Update package.json scripts and remove outDir from tsconfig.json ([a8b855c](https://github.com/MaxiGarcia13/padel-cantabria/commit/a8b855c))
- Update TypeScript configuration and repository functions ([38f1a5d](https://github.com/MaxiGarcia13/padel-cantabria/commit/38f1a5d))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.1 (2026-10-17)

### 🚀 Features

- Add team players management with CRUD operations and database schema updates ([7cb1235](https://github.com/MaxiGarcia13/padel-cantabria/commit/7cb1235))
- Introduce team page and standing components with match details, enhancing team information display ([1249e3f](https://github.com/MaxiGarcia13/padel-cantabria/commit/1249e3f))
- Add new team-related data retrieval functions for matches, phases, and standings in the database client ([09c29c3](https://github.com/MaxiGarcia13/padel-cantabria/commit/09c29c3))
- Implement team search functionality with autocomplete component, enhancing user experience in team selection ([4d67070](https://github.com/MaxiGarcia13/padel-cantabria/commit/4d67070))
- Add team retrieval functionality and new team page, enhancing navigation and user experience ([872734e](https://github.com/MaxiGarcia13/padel-cantabria/commit/872734e))
- Implement upsert functionality for team standings and enhance team fetching to include standings data ([da8de78](https://github.com/MaxiGarcia13/padel-cantabria/commit/da8de78))
- Extend team data types by adding TeamWithStandings and TeamStanding interfaces for improved data representation ([207a303](https://github.com/MaxiGarcia13/padel-cantabria/commit/207a303))
- Add team_standings table to database schema and update reset script to include it in the reset process ([9408cc4](https://github.com/MaxiGarcia13/padel-cantabria/commit/9408cc4))
- Enhance team data structure by adding standings fields, update related functions and queries for improved data handling ([0314187](https://github.com/MaxiGarcia13/padel-cantabria/commit/0314187))
- Add database migration and reset scripts, enhance package.json with new commands, and create README files for project documentation ([48f94ff](https://github.com/MaxiGarcia13/padel-cantabria/commit/48f94ff))
- Implement teams management by adding getTeams and upsertTeams functions, and refactor related database queries for consistency ([b42057c](https://github.com/MaxiGarcia13/padel-cantabria/commit/b42057c))
- Enhance database types by adding MatchWrite and Team interfaces, and refactor existing types for consistency ([54c8117](https://github.com/MaxiGarcia13/padel-cantabria/commit/54c8117))
- Add getMatches function to retrieve match data based on category, enhancing database client capabilities ([08a9eac](https://github.com/MaxiGarcia13/padel-cantabria/commit/08a9eac))
- Implement calendar scraping functionality with new scripts for parsing and saving match data, and refactor database client creation for improved modularity ([7ffff54](https://github.com/MaxiGarcia13/padel-cantabria/commit/7ffff54))
- Add getCategories and upsertMatches functions, and update Match type to extend CategoryKey for improved database interactions ([1eb6116](https://github.com/MaxiGarcia13/padel-cantabria/commit/1eb6116))
- Add Match type and MatchRecord interface, and create matches table in the database schema ([1579f1d](https://github.com/MaxiGarcia13/padel-cantabria/commit/1579f1d))
- Optimize league upsert process by checking for existing leagues to prevent duplicates during database operations ([4932f46](https://github.com/MaxiGarcia13/padel-cantabria/commit/4932f46))
- Introduce assembleLeagues function and refactor getLeagues to utilize it, enhancing league data handling and improving code organization ([2e3151b](https://github.com/MaxiGarcia13/padel-cantabria/commit/2e3151b))
- Enhance database client functionality by introducing createClient method, updating connection handling, and refactoring getLeagues and upsertLeagues functions for improved type safety and usability ([8077f07](https://github.com/MaxiGarcia13/padel-cantabria/commit/8077f07))
- Refactor league data handling by introducing upsertLeagues and getLeagues functions, update types for leagues, genders, and phases, and modify scrapers to accommodate new structure ([7fbac7a](https://github.com/MaxiGarcia13/padel-cantabria/commit/7fbac7a))
- Update package dependencies, add Prettier and ESLint configurations for web package, and standardize TypeScript version across packages ([0b3f3b7](https://github.com/MaxiGarcia13/padel-cantabria/commit/0b3f3b7))
- Enhance database schema and implement upsert functionality for calendar leagues with TypeScript types ([7c16249](https://github.com/MaxiGarcia13/padel-cantabria/commit/7c16249))
- Add database client and migration functionality with TypeScript support, update package.json and pnpm-lock.yaml ([bfb0ea0](https://github.com/MaxiGarcia13/padel-cantabria/commit/bfb0ea0))
- Replace Puppeteer dependency with @tursodatabase/serverless in database package and update pnpm-lock.yaml ([6d65287](https://github.com/MaxiGarcia13/padel-cantabria/commit/6d65287))
- Add database package with Puppeteer dependency and update nx.json to include it in release projects ([817edb7](https://github.com/MaxiGarcia13/padel-cantabria/commit/817edb7))

### 🐞 Fixes

- Remove duplicate export of TeamPlayer type in database index ([7f69d53](https://github.com/MaxiGarcia13/padel-cantabria/commit/7f69d53))

### 🔄 Refactors

- Restructure team-related types by moving TeamStandings and TeamWithStandings to a new file, updating imports across the codebase for improved organization and clarity ([340fee4](https://github.com/MaxiGarcia13/padel-cantabria/commit/340fee4))
- Update teams schema and related functions to remove phase and confirmed fields, enhancing data integrity and simplifying queries ([ec80301](https://github.com/MaxiGarcia13/padel-cantabria/commit/ec80301))
- Update database schema to standardize column names and add teams table for enhanced match organization ([7d936f5](https://github.com/MaxiGarcia13/padel-cantabria/commit/7d936f5))
- Update matches table schema by renaming columns and adding new fields for improved data structure and clarity ([39cc221](https://github.com/MaxiGarcia13/padel-cantabria/commit/39cc221))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo