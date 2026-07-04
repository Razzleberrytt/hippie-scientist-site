import { defineConfig } from 'vitest/config'
import { transformWithOxc, type Plugin } from 'vite'
import path from 'path'

function workspaceAliasPlugin(): Plugin {
  return {
    name: 'workspace-alias',
    enforce: 'pre' as const,
    async resolveId(source: string, importer: string | undefined) {
      const match = source.match(/^@\/(.*)$/)
      if (!match) return null

      const relativePath = match[1]
      const srcAttempt = path.resolve(__dirname, 'src', relativePath)
      const resolvedSrc = await this.resolve(srcAttempt, importer, { skipSelf: true })
      if (resolvedSrc) return resolvedSrc.id

      const rootAttempt = path.resolve(__dirname, relativePath)
      const resolvedRoot = await this.resolve(rootAttempt, importer, { skipSelf: true })
      return resolvedRoot?.id ?? null
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      // 'xlsx' is not an installed dependency — it's only referenced by a dead
      // standalone-CLI branch in scripts/data/build-interaction-data.mjs that
      // never executes under test. Alias it to a stub so Vite's static import
      // analysis can still resolve the specifier when transforming that file.
      xlsx: path.resolve(__dirname, 'scripts/data/xlsx-optional-dependency-stub.mjs'),
    },
  },
  plugins: [
    workspaceAliasPlugin(),
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
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'src/lib/**/*.ts', 'components/**/*.tsx', 'src/components/**/*.tsx'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
    },
  },
})
