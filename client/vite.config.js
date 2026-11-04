import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Since the Unit 8 lab the client calls the server by its full address (see
// src/api.js), so the session cookie travels with every request and the same
// code works when the two are deployed separately. No proxy is needed.
export default defineConfig({
  plugins: [react()]
})
