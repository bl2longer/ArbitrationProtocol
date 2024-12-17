import react from '@vitejs/plugin-react';
import { resolve } from "path";
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({}),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
