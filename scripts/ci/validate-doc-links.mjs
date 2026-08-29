#!/usr/bin/env node
/**
 * Fail on broken relative links in markdown.
 *
 * The documentation pass moved 92 files into `docs/archive/2026-08/`. Every
 * link that pointed at one of them is now broken, and a broken link in a
 * control document is worse than a missing one: it reads as a promise that
 * something exists.
 *
 * Only relative links are checked. External URLs are not fetched — that would
 * make the gate slow and dependent on the network — and anchors are checked
 * for the file, not the heading.
 *
 * Two things are deliberately not links to files:
 *   - a target starting with `/` is a site route (`/herbs/ashwagandha`), not a
 *     path on disk. The generated link maps are full of them.
 *   - `docs/generated/**` is script output; fixing a link there by hand would
 *     be undone by the next run.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const SCAN = ['docs']
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'out'])

/**
 * Script output. These are rewritten by the build, so a link fixed here by
 * hand is undone on the next run. `docs/internal-link-map.md` and its
 * siblings are emitted by scripts/data/build-internal-link-engine.mjs.
 */
const GENERATED = [
  'docs/generated/',
  // Archived material is frozen context. Its links were correct where the
  // documents used to live; rewriting them to survive the move would edit
  // historical records to make a linter happy.
  'docs/archive/',
  'docs/internal-link-map.md',
  'docs/topic-clusters.md',
  'docs/pages-needing-links.md',
]

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')

function collect() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.md')).map((f) => f)
  for (const d of SCAN) {
    const abs = path.join(ROOT, d)
    if (!fs.existsSync(abs)) continue
    const stack = [abs]
    while (stack.length) {
      const cur = stack.pop()
      for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
        const full = path.join(cur, e.name)
        if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) stack.push(full); continue }
        if (!e.name.endsWith('.md')) continue
        const r = rel(full)
        if (GENERATED.some((g) => r === g || r.startsWith(g))) continue
        files.push(r)
      }
    }
  }
  return files
}

// [text](target) — skipping images, external URLs, anchors, and mailto.
const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g

const problems = []
const files = collect()

for (const file of files) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    LINK.lastIndex = 0
    let m
    while ((m = LINK.exec(line))) {
      const raw = m[1]
      if (/^(https?:|mailto:|#|data:|tel:)/.test(raw)) continue
      if (raw.startsWith('/')) continue // site route, not a path on disk
      const target = raw.split('#')[0]
      if (!target) continue
      const resolved = path.resolve(path.dirname(path.join(ROOT, file)), target)
      if (!fs.existsSync(resolved)) {
        problems.push({ file, line: index + 1, target: raw })
      }
    }
  })
}

if (problems.length > 0) {
  console.error(`\n[doc-links] FAIL — ${problems.length} broken relative link(s)\n`)
  for (const p of problems.slice(0, 80)) console.error(`  ${p.file}:${p.line}  ->  ${p.target}`)
  if (problems.length > 80) console.error(`  ... and ${problems.length - 80} more`)
  console.error('\n  A broken link in a control document reads as a promise that something' +
    '\n  exists. Point it at the real path, or at docs/archive/ if the document' +
    '\n  was archived.\n')
  process.exit(1)
}

console.log(`[doc-links] PASS — ${files.length} markdown files, no broken relative links`)
