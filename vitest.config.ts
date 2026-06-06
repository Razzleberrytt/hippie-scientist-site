import { defineConfig } from 'vitest/config'
import { transformWithEsbuild } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'vitest-tsx-transform',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.endsWith('.tsx')) return null

        return transformWithEsbuild(code, id, {
          loader: 'tsx',
          jsx: 'automatic',
          jsxImportSource: 'react',
        })
      },
    },
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.claude/**', '**/out/**'],
  },
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib/display-utils': path.resolve(__dirname, './lib/display-utils'),
      '@/lib/decision-primitives': path.resolve(__dirname, './lib/decision-primitives'),
      '@/lib/evidence': path.resolve(__dirname, './lib/evidence'),
      '@/lib/safety-classification': path.resolve(__dirname, './lib/safety-classification'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/config': path.resolve(__dirname, './config'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@': path.resolve(__dirname, './'),
    },
  },
})
