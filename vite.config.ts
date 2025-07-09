import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2022', // Changed from 'esnext' for better compatibility
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          utils: ['fuse.js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['framer-motion', 'react-router-dom', 'lucide-react', 'fuse.js']
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173,
    open: true
  }
})
