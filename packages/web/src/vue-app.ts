import type { App } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export default (app: App) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
      },
    },
  });

  app.use(VueQueryPlugin, { queryClient });
};
