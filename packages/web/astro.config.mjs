import path from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import vercel from '@astrojs/vercel';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

try {
  loadEnvFile(path.join(rootDir, '.env'));
} catch (error) {
  console.error('Error loading environment variables:', error);
}

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [vue({ appEntrypoint: '/src/vue-app' })],
  vite: {
    envDir: rootDir,
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
  env: {
    schema: {
      TURSO_URL: envField.string({ context: 'server', access: 'secret' }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret' }),
    },
  },
});
