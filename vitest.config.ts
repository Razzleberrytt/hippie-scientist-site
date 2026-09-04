import { defineConfig } from 'vitest/config'
import { transformWithOxc, type Plugin } from 'vite'
import path from 'path'

const ROOT = import.meta.dirname

function workspaceAliasPlugin(): Plugin {
  return {
    name: 'workspace-alias',
    enforce: 'pre' as const,
    async resolveId(source: string, importer: string | undefined) {
      const match = source.match(/^@\/(.*)$/)
      if (!match) return null

      // '@/*' resolves to exactly one place: the repository root. This used to
      // try ./src first and fall back to the root, which is the reverse of the
      // tsconfig precedence ('@/*': ['./*', './src/*']). While both trees
      // existed, a module present in each resolved to a different file under
      // vitest than under tsc and next. There is now one tree, and one rule.
      const rootAttempt = path.resolve(ROOT, match[1])
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
      xlsx: path.resolve(ROOT, 'scripts/data/xlsx-optional-dependency-stub.mjs'),
      // 'server-only' is Next's client-bundle guard. It has no runtime
      // behaviour and is not a direct dependency, so Vite cannot resolve it and
      // any test importing a server module failed to load. Stubbing it here
      // keeps the real guard in the source and in production builds.
      'server-only': path.resolve(ROOT, 'tests/stubs/server-only.mjs'),
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
    // Native node:test suites are executed by `npm run test:node` and focused
    // owning workflows. Letting Vitest discover them makes Vite try to bundle
    // the prefix-only node:test builtin instead of exercising the native runner.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.claude/**',
      '**/out/**',
      'agent/lib/runtime-resilience.test.js',
      'scripts/enrichment-governor/__tests__/**',
      'scripts/content/__tests__/**',
    ],
    maxWorkers: '50%',
    testTimeout: 15000,
    pool: 'forks',
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'components/**/*.tsx'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
    },
  },
})