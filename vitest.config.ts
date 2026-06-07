import { defineConfig } from 'vitest/config'
import { transformWithOxc } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'vitest-tsx-transform',
      enforce: 'pre',
      async transform(code, id) {
        const filepath = id.split('?')[0]
        if (!filepath.endsWith('.tsx')) return null

        return transformWithOxc(code, id, {
          jsx: {
            runtime: 'automatic',
          }
        })
      },
    },
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.claude/**', '**/out/**'],
    maxWorkers: '50%',
    testTimeout: 15000,
    // @ts-expect-error poolOptions is supported by Vitest 4 but InlineConfig types in this environment do not declare it.
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
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
