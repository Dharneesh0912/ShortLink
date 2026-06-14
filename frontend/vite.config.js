import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/qrcodes': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy short-link redirects: any path that isn't a known frontend route
      // gets forwarded to the backend which handles the /:shortCode redirect
      '/r': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/r/, ''),
      },
    },
  },
})