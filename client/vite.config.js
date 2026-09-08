import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  // The browser can load the package's ESM entry directly. Keep the server's
  // CommonJS adapter intact for its serverless runtime.
  resolve: { alias: [{
    find: './astronomy.cjs',
    replacement: fileURLToPath(new URL('../node_modules/astronomy-engine/esm/astronomy.js', import.meta.url))
  }] },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
    proxy: { '/api': 'http://localhost:4000' }
  }
});
