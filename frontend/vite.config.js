import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/index-[hash]-v3.js`,
        chunkFileNames: `assets/[name]-[hash]-v3.js`,
      }
    }
  }
});
