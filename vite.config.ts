import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cu-portal.com',
        secure: true,
        rewrite: (path) => path.replace('/api', '/api/v1'),
      }
    }
  }
})
