#!/usr/bin/env node

/**
 * Accessibility pattern audit for static code review.
 *
 * This script is intentionally lightweight and dependency-free. It does not
 * replace axe/Lighthouse/manual screen-reader testing; it catches common code
 * patterns that repeatedly cause WCAG and jsx-a11y regressions.
 *
 * Default mode: report warnings and exit 0.
 * Strict mode: pass --strict to exit 1 when findings are present.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STRICT = process.argv.includes('--strict')
const INCLUDE_DIRS = ['app', 'components', 'src']
const IGNORE_DIR_PARTS = [
  `${path.sep}legacy-quarantine${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}out${path.sep}`,
]

const checks = [
  {
    id: 'focusable-noninteractive-tabindex',
    wcag: 'WCAG 2.1.1 Keyboard / jsx-a11y/no-noninteractive-tabindex',
    pattern: /tabIndex=\{0\}|tabIndex="0"/g,
    allow: (file) => file.endsWith(`components${path.sep}ui${path.sep}ResponsiveTable.tsx`),
    message: 'Avoid tabIndex={0} on noninteractive elements. Use a native control or the shared ResponsiveTable wrapper for scrollable tables.',
  },
  {
    id: 'unsupported-aria-expanded-on-search-input',
    wcag: 'WCAG 4.1.2 Name, Role, Value',
    pattern: /<input[\s\S]{0,600}type=["']search["'][\s\S]{0,600}aria-expanded=/g,
    allow: () => false,
    message: 'Do not put aria-expanded on a plain search input unless it has a supported combobox role/pattern.',
  },
  {
    id: 'raw-table-needs-review',
    wcag: 'WCAG 1.3.1 Info and Relationships',
    pattern: /<table\b/g,
    allow: (file, source, index) => {
      const before = source.slice(Math.max(0, index - 1200), index)
      const after = source.slice(index, index + 1800)
      return /<caption\b/.test(after) && /scope=["'](?:col|row)["']/.test(after + before)
    },
    message: 'Data tables should have a caption plus scope="col"/scope="row" headers. Confirm this table is semantic or migrate to ResponsiveTable.',
  },
  {
    id: 'small-explicit-target',
    wcag: 'WCAG 2.5.5 Target Size Enhanced AAA',
    pattern: /\b(?:h-8|w-8|min-h-8|min-w-8|h-9|w-9|min-h-9|min-w-9)\b/g,
    allow: (file, source, index) => {
      const local = source.slice(Math.max(0, index - 240), index + 240)
      return /aria-hidden|decorative|icon|svg|className="h-[45]/.test(local)
    },
    message: 'Interactive controls should usually be at least 44x44px. Decorative icons may remain smaller if the parent target is 44px.',
  },
  {
    id: 'icon-needs-hidden-or-label',
    wcag: 'WCAG 1.1.1 Non-text Content / 4.1.2 Name, Role, Value',
    pattern: /<(?:[A-Z][A-Za-z0-9]*Icon|Search|X|Menu|ChevronLeft|ChevronRight|ArrowUp|Moon|Sun|Shield|Target|Leaf|Sparkles|BookOpen|Calculator|AlertTriangle|GitCompare)\b(?![^>]*aria-hidden=)/g,
    allow: (file, source, index) => {
      const local = source.slice(Math.max(0, index - 260), index + 260)
      return /aria-label=|title=|role=/.test(local)
    },
    message: 'Decorative icons should use aria-hidden="true". Meaningful icon-only controls need an accessible name on the parent button/link.',
  },
]

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (IGNORE_DIR_PARTS.some((part) => full.includes(part))) continue
    if (entry.isDirectory()) {
      files.push(...walk(full))
    } else if (/\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) {
      files.push(full)
    }
  }

  return files
}

const files = INCLUDE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
const findings = []

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const rel = path.relative(ROOT, file)

  for (const check of checks) {
    for (const match of source.matchAll(check.pattern)) {
      const index = match.index ?? 0
      if (check.allow(file, source, index)) continue
      const line = source.slice(0, index).split('\n').length
      findings.push({
        file: rel,
        line,
        id: check.id,
        wcag: check.wcag,
        message: check.message,
      })
    }
  }
}

if (findings.length === 0) {
  console.log('✓ Accessibility pattern audit passed with no findings.')
  process.exit(0)
}

console.log(`Accessibility pattern audit found ${findings.length} item${findings.length === 1 ? '' : 's'}:`)
for (const finding of findings) {
  console.log(`\n${finding.file}:${finding.line}`)
  console.log(`  ${finding.id}`)
  console.log(`  ${finding.wcag}`)
  console.log(`  ${finding.message}`)
}

if (STRICT) {
  process.exit(1)
}

console.log('\nNon-strict mode: reporting only. Use --strict in CI after triaging existing findings.')
process.exit(0)
