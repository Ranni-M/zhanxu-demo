import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  // GitHub Pages 项目站点部署在 /<repo>/ 子路径下，构建时用 VITE_BASE 注入（见 scripts/build-pages.mjs）。
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3001' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:3001' } },
  build: { chunkSizeWarningLimit: 800 },
});
