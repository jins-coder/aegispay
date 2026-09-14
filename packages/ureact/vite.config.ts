import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'ureact': path.resolve(__dirname, './src/index.ts')
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
