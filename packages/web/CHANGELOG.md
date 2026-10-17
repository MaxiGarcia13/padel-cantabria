## 0.0.1 (2026-10-17)

### 🚀 Features

- Add number formatting utility and update standing value formatting ([b5c804e](https://github.com/MaxiGarcia13/padel-cantabria/commit/b5c804e))
- Integrate useHydrated composable into team page for improved hydration state management ([2d3026c](https://github.com/MaxiGarcia13/padel-cantabria/commit/2d3026c))
- Add TotalPoints component and integrate it into team page, along with new player tables for improved player management ([b59f928](https://github.com/MaxiGarcia13/padel-cantabria/commit/b59f928))
- Add API endpoint and composable for fetching team players ([88a1a7e](https://github.com/MaxiGarcia13/padel-cantabria/commit/88a1a7e))
- Enhance matches fetching by adding optional teamId parameter for filtering matches ([c55aec1](https://github.com/MaxiGarcia13/padel-cantabria/commit/c55aec1))
- Introduce useHydrated composable for managing hydration state across components ([d1df789](https://github.com/MaxiGarcia13/padel-cantabria/commit/d1df789))
- Add client-side rendering support to Autocomplete component with onMounted hook ([5cbacbb](https://github.com/MaxiGarcia13/padel-cantabria/commit/5cbacbb))
- Implement Autocomplete component with listbox and option components for enhanced user interaction ([7742f45](https://github.com/MaxiGarcia13/padel-cantabria/commit/7742f45))
- Introduce AutocompleteOption component for reusable option rendering in autocomplete and team search history ([261df2e](https://github.com/MaxiGarcia13/padel-cantabria/commit/261df2e))
- Enhance team autocomplete component with close functionality and integrate search history display ([cd7a7e9](https://github.com/MaxiGarcia13/padel-cantabria/commit/cd7a7e9))
- Add team search history component to display and manage recent team selections ([37f32e2](https://github.com/MaxiGarcia13/padel-cantabria/commit/37f32e2))
- Add history icon component for enhanced visual representation in the application ([80a27fe](https://github.com/MaxiGarcia13/padel-cantabria/commit/80a27fe))
- Implement useTeamSearchHistory composable for managing team search history with persistence ([c01cbdf](https://github.com/MaxiGarcia13/padel-cantabria/commit/c01cbdf))
- Implement initial data loading for team summary and phases in team page, enhancing performance and user experience ([64d1cd6](https://github.com/MaxiGarcia13/padel-cantabria/commit/64d1cd6))
- Enhance team autocomplete component to utilize league data for improved team display labels ([c978b70](https://github.com/MaxiGarcia13/padel-cantabria/commit/c978b70))
- Enhance select component with ChevronDownIcon for improved dropdown aesthetics ([0a0577e](https://github.com/MaxiGarcia13/padel-cantabria/commit/0a0577e))
- Integrate BackButton component into league and team pages for enhanced navigation ([56ba5db](https://github.com/MaxiGarcia13/padel-cantabria/commit/56ba5db))
- Add team card skeleton component for loading state representation in team page ([b9c045d](https://github.com/MaxiGarcia13/padel-cantabria/commit/b9c045d))
- Introduce team page and standing components with match details, enhancing team information display ([1249e3f](https://github.com/MaxiGarcia13/padel-cantabria/commit/1249e3f))
- Establish language conventions for code and UI, ensuring English is used in codebase while Spanish is reserved for user-visible text ([40f365d](https://github.com/MaxiGarcia13/padel-cantabria/commit/40f365d))
- Implement team phases and summary API endpoints along with composable functions for data retrieval ([659668e](https://github.com/MaxiGarcia13/padel-cantabria/commit/659668e))
- Add calendar page for league matches with dynamic routing and match display ([ba9b61c](https://github.com/MaxiGarcia13/padel-cantabria/commit/ba9b61c))
- Revamp index page layout with new branding and improved content structure for enhanced user engagement ([1a87343](https://github.com/MaxiGarcia13/padel-cantabria/commit/1a87343))
- Enhance dialog and searcher components with variant support and close functionality for improved user interaction ([a76da1b](https://github.com/MaxiGarcia13/padel-cantabria/commit/a76da1b))
- Integrate navigation transitions and enhance search components for improved user experience and visual consistency ([4a9a393](https://github.com/MaxiGarcia13/padel-cantabria/commit/4a9a393))
- Enhance dialog component with close button and click outside functionality for improved user interaction ([87f460a](https://github.com/MaxiGarcia13/padel-cantabria/commit/87f460a))
- Introduce Button component and refactor back-button and searcher components for improved UI consistency and functionality ([8cb42d6](https://github.com/MaxiGarcia13/padel-cantabria/commit/8cb42d6))
- Add ZoomIcon component and integrate it into the searcher for improved search functionality ([7cfa64b](https://github.com/MaxiGarcia13/padel-cantabria/commit/7cfa64b))
- Refactor search components and implement new searcher form for enhanced user experience and functionality ([4eefdb1](https://github.com/MaxiGarcia13/padel-cantabria/commit/4eefdb1))
- Implement team search functionality with autocomplete component, enhancing user experience in team selection ([4d67070](https://github.com/MaxiGarcia13/padel-cantabria/commit/4d67070))
- Introduce BackButton component for improved navigation and integrate it into the header, enhancing user experience ([4e480aa](https://github.com/MaxiGarcia13/padel-cantabria/commit/4e480aa))
- Add team retrieval functionality and new team page, enhancing navigation and user experience ([872734e](https://github.com/MaxiGarcia13/padel-cantabria/commit/872734e))
- Add @maxigarcia/js-utils package version 1.22.1 to dependencies and update pnpm-lock.yaml accordingly ([aecebb0](https://github.com/MaxiGarcia13/padel-cantabria/commit/aecebb0))
- Add nanostores package version 1.5.5 to dependencies and update pnpm-lock.yaml accordingly ([fce9848](https://github.com/MaxiGarcia13/padel-cantabria/commit/fce9848))
- Enhance header component with BrandIcon and update global styles for improved visual consistency ([91a2e7b](https://github.com/MaxiGarcia13/padel-cantabria/commit/91a2e7b))
- Add new favicon and apple touch icon images for improved branding and user experience ([0ee47dc](https://github.com/MaxiGarcia13/padel-cantabria/commit/0ee47dc))
- Add dialog component with modal functionality, including showModal and close methods for improved user interaction ([f87daa3](https://github.com/MaxiGarcia13/padel-cantabria/commit/f87daa3))
- Add standings table component with position trend visualization and team data fetching functionality ([fde6b1f](https://github.com/MaxiGarcia13/padel-cantabria/commit/fde6b1f))
- Implement jsonApiError utility for consistent error handling in API routes and add teams API endpoint for fetching team data ([f80f4b9](https://github.com/MaxiGarcia13/padel-cantabria/commit/f80f4b9))
- Introduce Vue components for skeleton loading states and replace Astro components for matches display, enhancing user experience during data fetching ([817c389](https://github.com/MaxiGarcia13/padel-cantabria/commit/817c389))
- Add components for displaying closest matches and matches by date, along with API integration for match data retrieval ([02b2f99](https://github.com/MaxiGarcia13/padel-cantabria/commit/02b2f99))
- Implement match sorting and grouping functionality with new utilities for retrieving closest matches and organizing matches by date ([a920be6](https://github.com/MaxiGarcia13/padel-cantabria/commit/a920be6))
- Implement collapsible search summary toggle and enhance search component with improved state management for better user experience in the web package ([e686a50](https://github.com/MaxiGarcia13/padel-cantabria/commit/e686a50))
- Refactor search functionality by introducing useSearchFilters and useSearchNavigation composables for improved state management and navigation in the search component ([06ddb60](https://github.com/MaxiGarcia13/padel-cantabria/commit/06ddb60))
- Enhance header and search components with initial values for improved user experience and state management in the web package ([dbe2f88](https://github.com/MaxiGarcia13/padel-cantabria/commit/dbe2f88))
- Refactor search components and implement header for improved navigation and user experience in the web package ([62c2a45](https://github.com/MaxiGarcia13/padel-cantabria/commit/62c2a45))
- Enhance LeaguePicker component with search functionality and improve styling across components for better user experience ([9dde677](https://github.com/MaxiGarcia13/padel-cantabria/commit/9dde677))
- Add Field, Select, and LeaguePicker components for improved form handling and league selection in the web package ([e5c85fd](https://github.com/MaxiGarcia13/padel-cantabria/commit/e5c85fd))
- Implement useLeagues composable to fetch and manage league data using Vue Query, enhancing data retrieval and state management in the web package ([61651ec](https://github.com/MaxiGarcia13/padel-cantabria/commit/61651ec))
- Configure Vue integration with custom app entry point and add VueQuery setup for improved state management in the web package ([bd46914](https://github.com/MaxiGarcia13/padel-cantabria/commit/bd46914))
- Enhance database client functionality by introducing createClient method, updating connection handling, and refactoring getLeagues and upsertLeagues functions for improved type safety and usability ([8077f07](https://github.com/MaxiGarcia13/padel-cantabria/commit/8077f07))
- Add ESLint and Prettier configurations to web package, including linting scripts and updated devDependencies in package.json ([5623a58](https://github.com/MaxiGarcia13/padel-cantabria/commit/5623a58))
- Update ESLint configuration for web package to include global CSS path and ignore web package in root config ([443e9b1](https://github.com/MaxiGarcia13/padel-cantabria/commit/443e9b1))
- Add Tailwind CSS support to ESLint configuration, update package dependencies, and clean up package.json files ([773efd6](https://github.com/MaxiGarcia13/padel-cantabria/commit/773efd6))
- Update package dependencies, add Prettier and ESLint configurations for web package, and standardize TypeScript version across packages ([0b3f3b7](https://github.com/MaxiGarcia13/padel-cantabria/commit/0b3f3b7))
- Import global CSS styles into app layout for consistent styling across the web package ([f02a4b2](https://github.com/MaxiGarcia13/padel-cantabria/commit/f02a4b2))
- Integrate Tailwind CSS into web package, update configuration files, and add global styles ([6eefbd0](https://github.com/MaxiGarcia13/padel-cantabria/commit/6eefbd0))
- Add web package with Astro integration, update nx.json and package.json, and configure TypeScript ([5bdd75c](https://github.com/MaxiGarcia13/padel-cantabria/commit/5bdd75c))

### 🐞 Fixes

- Update link text in closest-matches component for clarity ([bf2beec](https://github.com/MaxiGarcia13/padel-cantabria/commit/bf2beec))

### 🔄 Refactors

- Remove unused resetTeamSearch function from searcher-form component to streamline code ([f6bf3c8](https://github.com/MaxiGarcia13/padel-cantabria/commit/f6bf3c8))
- Rearrange query client initialization in vue-app.ts for improved readability and structure ([0b77ace](https://github.com/MaxiGarcia13/padel-cantabria/commit/0b77ace))
- Update header and searcher components for improved layout and responsiveness ([ef84ba5](https://github.com/MaxiGarcia13/padel-cantabria/commit/ef84ba5))
- Update dialog component styles for improved visual consistency and alignment with design system ([7d60f2d](https://github.com/MaxiGarcia13/padel-cantabria/commit/7d60f2d))
- Restructure team-related types by moving TeamStandings and TeamWithStandings to a new file, updating imports across the codebase for improved organization and clarity ([340fee4](https://github.com/MaxiGarcia13/padel-cantabria/commit/340fee4))
- Standardize parameter names in match fetching and category parsing functions for consistency ([d1eb5a8](https://github.com/MaxiGarcia13/padel-cantabria/commit/d1eb5a8))
- Clean up component code and improve formatting for better readability in the web package ([380fb74](https://github.com/MaxiGarcia13/padel-cantabria/commit/380fb74))

### 🧹 Chores

- Remove nanostores package version 1.5.5 from dependencies and update pnpm-lock.yaml accordingly ([950bc62](https://github.com/MaxiGarcia13/padel-cantabria/commit/950bc62))
- Update pnpm-lock.yaml and package.json to add '@tanstack/vue-query' dependency and related packages, ensuring compatibility and enhancing functionality in the web package ([2a18843](https://github.com/MaxiGarcia13/padel-cantabria/commit/2a18843))
- Add '@astrojs/node' dependency to package.json for improved server-side rendering support ([46c0a38](https://github.com/MaxiGarcia13/padel-cantabria/commit/46c0a38))

### 🎨 Styles

- Refactor BackButton component class for improved alignment and simplify TeamPage component rendering in team page ([7e0b78b](https://github.com/MaxiGarcia13/padel-cantabria/commit/7e0b78b))
- Adjust BackButton component alignment and remove unnecessary width constraint in calendar page for improved layout consistency ([036fb05](https://github.com/MaxiGarcia13/padel-cantabria/commit/036fb05))
- Enhance team page layout with responsive grid adjustments and wrap select component for better alignment ([ddfc2a2](https://github.com/MaxiGarcia13/padel-cantabria/commit/ddfc2a2))
- Update header component to align items centrally on small screens for improved layout consistency ([8a460ab](https://github.com/MaxiGarcia13/padel-cantabria/commit/8a460ab))
- Adjust padding on index page main section for improved layout and visual consistency ([9131938](https://github.com/MaxiGarcia13/padel-cantabria/commit/9131938))
- Refactor button, header, and index components for improved readability and consistency in code formatting ([35cb0c9](https://github.com/MaxiGarcia13/padel-cantabria/commit/35cb0c9))
- Update button component to include cursor pointer for better user interaction and enhance global styles for button elements ([5659573](https://github.com/MaxiGarcia13/padel-cantabria/commit/5659573))
- Update dialog component width for improved layout and responsiveness ([74ba603](https://github.com/MaxiGarcia13/padel-cantabria/commit/74ba603))

### 🧱 Updated Dependencies

- Updated @padel-cantabria/database to 0.0.1

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo