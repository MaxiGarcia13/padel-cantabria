import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(import.meta.dirname, 'chat'),
  publicDir: resolve(import.meta.dirname, '../web/public'),
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'chat/src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/mcp': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
      '/chat': 'http://localhost:3001',
      '/categories': 'http://localhost:3001',
      '/phases': 'http://localhost:3001',
      '/teams': 'http://localhost:3001',
      '/players': 'http://localhost:3001',
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist/chat'),
    emptyOutDir: true,
  },
});
