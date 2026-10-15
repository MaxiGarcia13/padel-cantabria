import path from 'node:path';
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [vue({ appEntrypoint: '/src/vue-app' })],
  vite: {
    envDir: rootDir,
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      TURSO_URL: envField.string({ context: 'server', access: 'secret' }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret' }),
    },
  },
});
