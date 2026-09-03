#!/usr/bin/env node
// test:node — run every native `node:test` suite in the repository.
//
// Vitest cannot run these: vitest.config.ts explicitly excludes
// scripts/enrichment-governor/__tests__ and scripts/content/__tests__ because
// Vite tries to bundle the prefix-only `node:test` builtin instead of handing
// them to the intended runner. Until this script existed, that meant
// `npm run test` reported a fully green suite while ~75 assertions across three
// directories were only ever executed by four separate GitHub workflows — so a
// broken governor test could sit on main, invisible to every local command.
// (That is exactly how the Propionate closure regression reached main.)
//
// Suites are discovered by content rather than listed by path, so a new
// `node:test` file in a new directory is picked up automatically instead of
// silently going unrun.
//
// The inverse trap is real too and is why discovery is this strict: specs that
// import `describe`/`it`/`expect` from vitest must NOT be run here. Handing one
// to `node --test` loads vitest's runner uninitialized and dies with
// "Cannot read properties of undefined (reading 'config')" — see the note in
// .github/workflows/evidence-graph-identity-check.yml. Only a real top-level
// `import ... from 'node:test'` qualifies.

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const IGNORED_DIRS = new Set([
  'node_modules', '.next', 'out', 'dist', 'coverage', '.git', '.build-cache', '.content-collections',
])
const CANDIDATE_EXTS = new Set(['.mjs', '.js', '.ts'])

// A real top-level import of the node:test builtin. Deliberately anchored to the
// start of a line so a mention inside a comment or a fixture string literal —
// scripts/ci/validate-direct-dependencies.mjs writes exactly such a fixture —
// is not mistaken for a suite.
const NODE_TEST_IMPORT = /^import\s[^\n]*\sfrom\s+['"]node:test['"]/m

function collect(dir, out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collect(full, out)
    else if (CANDIDATE_EXTS.has(path.extname(entry.name))) out.push(full)
  }
  return out
}

const suites = collect(ROOT)
  .filter((file) => NODE_TEST_IMPORT.test(fs.readFileSync(file, 'utf8')))
  .map((file) => path.relative(ROOT, file).split(path.sep).join('/'))
  .sort()

if (suites.length === 0) {
  console.error('[test:node] no node:test suites found — discovery is probably broken')
  process.exit(1)
}

console.log(`[test:node] running ${suites.length} native node:test suite(s):`)
for (const suite of suites) console.log(`  ${suite}`)

const result = spawnSync(process.execPath, ['--test', ...suites], { stdio: 'inherit' })
if (result.error) {
  console.error(`[test:node] failed to start: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)
