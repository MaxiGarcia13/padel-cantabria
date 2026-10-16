import type { App } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

const QUERY_CLIENT_OPTIONS = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
} as const;

/** Shared on the client so Astro islands reuse the same cache. */
const browserQueryClient = import.meta.env.SSR
  ? null
  : new QueryClient(QUERY_CLIENT_OPTIONS);

export default (app: App) => {
  const queryClient = browserQueryClient ?? new QueryClient(QUERY_CLIENT_OPTIONS);

  app.use(VueQueryPlugin, { queryClient });
};
