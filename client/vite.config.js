import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          qr: ['qrcode.react'],
          utils: ['axios', 'date-fns']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://eventx-studio-production-a8ab.up.railway.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})  