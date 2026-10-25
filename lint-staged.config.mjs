export default {
  // Root lint:fix already runs each package's eslint on `.`.
  // Do not append staged paths — pnpm -r would pass them to every package
  // (e.g. assistant formatting web .astro files).
  '*': () => 'pnpm lint:fix',
};
