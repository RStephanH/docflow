import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {                          // ← AJOUT
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://backend:3000',
        changeOrigin: true,
      }
    }
  }
})