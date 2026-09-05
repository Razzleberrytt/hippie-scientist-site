import { defineConfig } from 'vitest/config'
import { transformWithOxc, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'path'

const ROOT = import.meta.dirname
const NODE_TEST_IGNORED_DIRS = new Set([
  'node_modules', '.next', 'out', 'dist', 'coverage', '.git', '.build-cache', '.content-collections',
])
const NODE_TEST_CANDIDATE_EXTS = new Set(['.mjs', '.js', '.ts'])
// Keep this rule intentionally identical to scripts/run-node-tests.mjs: only a
// real top-level import of node:test transfers ownership to the native runner.
const NODE_TEST_IMPORT = /^import\s[^\n]*\sfrom\s+['"]node:test['"]/m

function collectNativeNodeTestSuites(dir = ROOT, out: string[] = []): string[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }

  for (const entry of entries) {
    if (NODE_TEST_IGNORED_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectNativeNodeTestSuites(full, out)
      continue
    }
    if (!NODE_TEST_CANDIDATE_EXTS.has(path.extname(entry.name))) continue
    if (!NODE_TEST_IMPORT.test(fs.readFileSync(full, 'utf8'))) continue
    out.push(path.relative(ROOT, full).split(path.sep).join('/'))
  }

  return out
}

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
    // Native node:test suites are owned by `npm run test:node`. Discover their
    // exact paths with the same anchored import rule as that runner so a new
    // suite in any directory cannot be accidentally bundled by Vitest.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.claude/**',
      '**/out/**',
      ...collectNativeNodeTestSuites(),
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