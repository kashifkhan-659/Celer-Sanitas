import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: proxy /api → local Express server so the client can fetch trees without CORS/base-URL
// juggling. Prod (separate deploys): set VITE_API_BASE_URL to the backend origin instead.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
