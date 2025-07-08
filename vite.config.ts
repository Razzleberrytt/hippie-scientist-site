import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['framer-motion', 'react-router-dom', 'lucide-react']
  }
})
