#!/usr/bin/env node
/**
 * Recurrence check for the src/ amputation.
 *
 * The repository carried a second source tree for months. 300 of its 584 files
 * were unreachable from any production entry point or live test, and the cost
 * was paid on every search, every import, and every session that had to be told
 * which of `lib/` and `src/lib/` was the real one.
 *
 * Deleting it once only resets a counter. This gate keeps the count at zero by
 * failing when a file under lib/ or components/ is reachable from nothing.
 *
 * Reachability is computed exactly the way the amputation computed it:
 *
 *   roots = every code file outside lib/ and components/, plus every test file
 *           anywhere (vitest applies no `include` restriction, so all of them
 *           execute)
 *
 * A file is an orphan when nothing in that closure imports it. Static analysis
 * cannot see string-path references, so quoted repo-relative paths ending in a
 * code extension are followed too — that is how next.config.mjs reaches
 * lib/cloudflare-image-loader.ts, and how the report scripts reach
 * lib/herb-data.ts.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

/** Directories policed for orphans. */
const GOVERNED = ['lib', 'components']

const CODE_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
const RESOLVE_EXT = [...CODE_EXT, '.json', '.d.ts']

const SKIP_ROOTS = new Set([
  'node_modules', '.next', 'out', '.git', 'dist', 'coverage',
  '.content-collections', 'public', 'ops', 'artifacts', '.claude',
])

/**
 * A ratchet. config/orphan-baseline.json records the orphans that are tolerated;
 * the gate fails on any orphan not in that file, so the number can fall but
 * never rise. It was introduced holding 121 entries — 120 of them pre-existing
 * root-tree dead code that had simply never been measured — and those were
 * verified and deleted, so the list is now empty and this is a strict
 * zero-check.
 */
const BASELINE_PATH = path.join(ROOT, 'config', 'orphan-baseline.json')
const baseline = new Set(JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')).orphans)

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')

function walk(dir, acc = []) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return acc }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const r = rel(full)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue
      if (SKIP_ROOTS.has(r)) continue
      walk(full, acc)
    } else if (CODE_EXT.includes(path.extname(e.name))) {
      acc.push(full)
    }
  }
  return acc
}

const isTest = (f) => /(^|\/)__tests__\//.test(rel(f)) || /\.(test|spec)\.[tj]sx?$/.test(rel(f))
const isGoverned = (f) => GOVERNED.some((d) => rel(f).startsWith(d + '/'))

function resolveSpec(spec, fromFile) {
  if (!spec || spec.startsWith('node:')) return null
  const cands = []
  if (spec.startsWith('.')) cands.push(path.resolve(path.dirname(fromFile), spec))
  else if (spec.startsWith('@/')) cands.push(path.join(ROOT, spec.slice(2)))
  else if (spec.startsWith('/')) cands.push(path.join(ROOT, spec))
  else if (GOVERNED.some((d) => spec.startsWith(d + '/'))) cands.push(path.join(ROOT, spec))
  else return null

  for (const base of cands) {
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base
    for (const e of RESOLVE_EXT) if (fs.existsSync(base + e)) return base + e
    const swapped = base.replace(/\.(js|mjs)$/, '')
    if (swapped !== base) for (const e of RESOLVE_EXT) if (fs.existsSync(swapped + e)) return swapped + e
    if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
      for (const e of RESOLVE_EXT) {
        const idx = path.join(base, 'index' + e)
        if (fs.existsSync(idx)) return idx
      }
    }
  }
  return null
}

const SPEC_RES = [
  /\bimport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bexport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bvi\.mock\s*\(\s*['"]([^'"]+)['"]/g,
  /\bvi\.doMock\s*\(\s*['"]([^'"]+)['"]/g,
  // Quoted repo-relative path used as data rather than as an import.
  /['"`]((?:\.\/)?(?:lib|components)\/[A-Za-z0-9_\-./]+\.(?:tsx?|jsx?|mjs|cjs))['"`]/g,
]

const cache = new Map()
function deps(file) {
  if (cache.has(file)) return cache.get(file)
  let text = ''
  try { text = fs.readFileSync(file, 'utf8') } catch { /* unreadable */ }
  const out = new Set()
  for (const re of SPEC_RES) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text))) {
      const t = resolveSpec(m[1], file)
      if (t) out.add(t)
    }
  }
  const arr = [...out]
  cache.set(file, arr)
  return arr
}

const all = walk(ROOT)
const roots = all.filter((f) => !isGoverned(f) || isTest(f))

const reached = new Set()
const queue = [...roots]
while (queue.length) {
  const f = queue.pop()
  if (reached.has(f)) continue
  reached.add(f)
  for (const d of deps(f)) if (!reached.has(d)) queue.push(d)
}

const orphansAll = all
  .filter(isGoverned)
  .filter((f) => !isTest(f))
  .filter((f) => !reached.has(f))
  .map(rel)
  .sort()

const appeared = orphansAll.filter((f) => !baseline.has(f))
const cleared = [...baseline].filter((f) => !orphansAll.includes(f)).sort()

if (appeared.length > 0) {
  console.error(`\n[no-orphans] FAIL — ${appeared.length} new unreferenced file(s) under ${GOVERNED.join('/, ')}/\n`)
  for (const o of appeared) console.error(`  ${o}`)
  console.error(
    '\n  Nothing imports these, and no test covers them. The repository carried a' +
      '\n  second unreachable source tree for months; this gate exists so that does' +
      '\n  not happen again.' +
      '\n\n  Delete them, or wire them up. If a file is reached by a mechanism this' +
      '\n  scan cannot model, extend the resolver rather than baselining it.\n'
  )
  process.exit(1)
}

if (cleared.length > 0) {
  console.log(`[no-orphans] ${cleared.length} baselined orphan(s) are now reachable or gone.`)
  console.log('  Drop them from config/orphan-baseline.json to lock the improvement in:')
  for (const f of cleared) console.log(`    ${f}`)
}

const governedCount = all.filter(isGoverned).length
console.log(
  `[no-orphans] PASS — ${governedCount} files under ${GOVERNED.join('/, ')}/, ` +
    `${orphansAll.length} known orphan(s), 0 new`
)