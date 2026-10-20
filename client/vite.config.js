import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The proxy lets the React code call relative paths like fetch('/api/trips').
// Vite forwards anything under /api to the Express server on port 3001, so the
// browser only ever talks to one origin and there is no CORS problem in development.
// https://vite.dev/config/server-options#server-proxy
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001'
      }
    }
  }
})
