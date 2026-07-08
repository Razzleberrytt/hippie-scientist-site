#!/usr/bin/env node
/**
 * Guard: block committing the output of a full `npm run data:build`.
 *
 * The deploy path (`build:fast` -> `data:build:core`) regenerates the top-level
 * runtime lists WITHOUT the governance overlay + postprocess. The full
 * `npm run data:build` runs those extra steps, which stamp a `governance` object
 * (and a default `safety` string / empty `sources[]`) onto EVERY record — ~855 of
 * them — and apply source-gate downgrades. None of that belongs in the committed
 * top-level lists: it produces a thousand-line diff unrelated to the actual change
 * and conflicts with every parallel promotion.
 *
 * This is exactly the trap that turned a one-line profile change into a massive,
 * quota-burning diff. The correct rebuild for a committed change is
 * `npm run data:build:core` (or `npm run promote:profile` for a promotion), which
 * this guard enforces by refusing the full-build signature.
 *
 * Convention this guard protects (verified on main):
 *   - public/data/herbs.json     : NO `governance` blocks, NO postprocess safety-default
 *   - public/data/compounds.json : NO `governance` blocks, NO postprocess safety-default
 * (Detail files under *-detail/ ARE overlay-maintained and legitimately carry
 *  `governance` — they are intentionally NOT checked here.)
 *
 * Exit 1 on drift, 0 when clean.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// Top-level runtime lists that the deploy path commits without the overlay.
const GUARDED_FILES = ['public/data/herbs.json', 'public/data/compounds.json']

// Signatures that only the full-build (overlay + postprocess) steps introduce.
const SIGNATURES = [
  { label: 'governance overlay block', re: /"governance"\s*:/g },
  { label: 'postprocess safety default', re: /Generally well tolerated for most users\./g },
]

const failures = []

for (const rel of GUARDED_FILES) {
  const file = path.join(ROOT, rel)
  if (!fs.existsSync(file)) continue
  const text = fs.readFileSync(file, 'utf8')
  for (const sig of SIGNATURES) {
    const count = (text.match(sig.re) || []).length
    if (count > 0) failures.push({ rel, label: sig.label, count })
  }
}

if (failures.length) {
  console.error('\n[guard-no-full-build-drift] FAILED — full `data:build` output was committed to the top-level lists:\n')
  for (const f of failures) {
    console.error(`  - ${f.rel}: ${f.count} × ${f.label}`)
  }
  console.error('\nThese fields are added by the governance overlay + postprocess, which the deploy')
  console.error('path (build:fast -> data:build:core) does NOT run. Committing them rewrites ~855')
  console.error('records and conflicts with every parallel promotion.\n')
  console.error('Fix: regenerate with the CORE pipeline, then re-commit these files:')
  console.error('  git checkout -- public/data/herbs.json public/data/compounds.json   # drop the drift')
  console.error('  npm run data:build:core                                             # drift-free rebuild')
  console.error('For a profile promotion, prefer:  npm run promote:profile -- --slug <slug>')
  console.error('See docs/promoting-profiles.md.\n')
  process.exit(1)
}

console.log('[guard-no-full-build-drift] PASS: top-level runtime lists are free of full-build overlay/postprocess drift.')
