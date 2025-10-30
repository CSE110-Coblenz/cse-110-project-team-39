import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
});