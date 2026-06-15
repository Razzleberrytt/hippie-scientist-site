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
    pool: 'forks',
    fileParallelism: false,
  },
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: '$1',
        async customResolver(source: any, importer: any, options: any) {
          const srcAttempt = path.resolve(__dirname, 'src', source)
          const resolvedSrc = await this.resolve(srcAttempt, importer, { skipSelf: true })
          if (resolvedSrc) return resolvedSrc

          const rootAttempt = path.resolve(__dirname, source)
          return this.resolve(rootAttempt, importer, { skipSelf: true })
        }
      }
    ] as any
  },
})
