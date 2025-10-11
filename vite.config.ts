import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    // Temporarily disable the PWA plugin while hash routing is in use.
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest,
    //   includeAssets: ['icon-192x192.png', 'icon-512x512.png'],
    //   workbox: {
    //     navigateFallback: '/offline.html',
    //     runtimeCaching: [
    //       {
    //         urlPattern: /\/database/,
    //         handler: 'NetworkFirst',
    //         options: { cacheName: 'pages' },
    //       },
    //       {
    //         urlPattern: /\/?$/,
    //         handler: 'NetworkFirst',
    //         options: { cacheName: 'pages' },
    //       },
    //     ],
    //   },
    // }),
  ],
  server: {
    historyApiFallback: true,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_ID__: JSON.stringify(Date.now().toString()),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  }
})
