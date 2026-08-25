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
 * Ratchet mode: combine --strict with --baseline-ref=<git-ref> to fail only
 * when a file/rule finding count increases relative to that exact base ref.
 * Existing debt may shrink but may not be traded across files or rule types.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STRICT = process.argv.includes('--strict')
const baselineArg = process.argv.find((arg) => arg.startsWith('--baseline-ref='))
const BASELINE_REF = baselineArg?.slice('--baseline-ref='.length).trim() || null
const INCLUDE_DIRS = ['app', 'components', 'src']
const IGNORE_DIR_PARTS = [
  `${path.sep}legacy-quarantine${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}out${path.sep}`,
]
const SOURCE_EXTENSION = /\.(tsx|ts|jsx|js|mdx)$/

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
    allow: (_file, source, index) => {
      const local = source.slice(index, index + 900)
      return /role=["']combobox["']/.test(local)
    },
    message: 'Do not put aria-expanded on a plain search input unless it has a supported combobox role/pattern.',
  },
  {
    id: 'raw-table-needs-review',
    wcag: 'WCAG 1.3.1 Info and Relationships',
    pattern: /<table\b/g,
    allow: (_file, source, index) => {
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
    allow: (_file, source, index) => {
      const local = source.slice(Math.max(0, index - 240), index + 240)
      return /aria-hidden|decorative|icon|svg|className="h-[45]/.test(local)
    },
    message: 'Interactive controls should usually be at least 44x44px. Decorative icons may remain smaller if the parent target is 44px.',
  },
  {
    id: 'icon-needs-hidden-or-label',
    wcag: 'WCAG 1.1.1 Non-text Content / 4.1.2 Name, Role, Value',
    pattern: /<(?:[A-Z][A-Za-z0-9]*Icon|Search|X|Menu|ChevronLeft|ChevronRight|ArrowUp|Moon|Sun|Shield|Target|Leaf|Sparkles|BookOpen|Calculator|AlertTriangle|GitCompare)\b(?![^>]*aria-hidden=)/g,
    allow: (_file, source, index) => {
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
    } else if (SOURCE_EXTENSION.test(entry.name)) {
      files.push(full)
    }
  }

  return files
}

function normalizedRelative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/')
}

function scan(entries) {
  const findings = []

  for (const { file, rel, source } of entries) {
    for (const check of checks) {
      check.pattern.lastIndex = 0
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

  return findings
}

function currentEntries() {
  return INCLUDE_DIRS
    .flatMap((dir) => walk(path.join(ROOT, dir)))
    .map((file) => ({ file, rel: normalizedRelative(file), source: fs.readFileSync(file, 'utf8') }))
}

function baselineEntries(ref) {
  let listed
  try {
    listed = execFileSync(
      'git',
      ['ls-tree', '-r', '--name-only', ref, '--', ...INCLUDE_DIRS],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch (error) {
    const stderr = String(error?.stderr || '').trim()
    throw new Error(`Could not read accessibility baseline ref ${ref}${stderr ? `: ${stderr}` : ''}`)
  }

  return listed
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((rel) => SOURCE_EXTENSION.test(rel))
    .filter((rel) => !rel.includes('/legacy-quarantine/'))
    .map((rel) => {
      const source = execFileSync('git', ['show', `${ref}:${rel}`], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      return { file: rel, rel, source }
    })
}

function findingCounts(findings) {
  const counts = new Map()
  for (const finding of findings) {
    const key = `${finding.file}\u0000${finding.id}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

function findRegressions(current, baseline) {
  const currentCounts = findingCounts(current)
  const baselineCounts = findingCounts(baseline)
  const regressions = []

  for (const [key, currentCount] of currentCounts) {
    const baselineCount = baselineCounts.get(key) || 0
    if (currentCount <= baselineCount) continue
    const [file, id] = key.split('\u0000')
    const example = current.find((finding) => finding.file === file && finding.id === id)
    regressions.push({
      file,
      id,
      currentCount,
      baselineCount,
      added: currentCount - baselineCount,
      wcag: example?.wcag || '',
      message: example?.message || '',
    })
  }

  return regressions.sort((a, b) => a.file.localeCompare(b.file) || a.id.localeCompare(b.id))
}

const findings = scan(currentEntries())

if (BASELINE_REF) {
  let baselineFindings
  try {
    baselineFindings = scan(baselineEntries(BASELINE_REF))
  } catch (error) {
    console.error(`[accessibility-patterns] ${error.message}`)
    process.exit(2)
  }

  const regressions = findRegressions(findings, baselineFindings)
  console.log(`Accessibility pattern ratchet: current=${findings.length}, baseline=${baselineFindings.length}, regressions=${regressions.reduce((sum, item) => sum + item.added, 0)}.`)

  if (regressions.length === 0) {
    console.log('✓ Accessibility pattern ratchet passed: no file/rule finding count increased relative to the exact baseline ref.')
    process.exit(0)
  }

  console.log('Accessibility pattern regressions:')
  for (const regression of regressions) {
    console.log(`\n${regression.file}`)
    console.log(`  ${regression.id}: ${regression.baselineCount} → ${regression.currentCount} (+${regression.added})`)
    console.log(`  ${regression.wcag}`)
    console.log(`  ${regression.message}`)
  }

  if (STRICT) process.exit(1)
  console.log('\nNon-strict ratchet mode: reporting regressions only.')
  process.exit(0)
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

if (STRICT) process.exit(1)

console.log('\nNon-strict mode: reporting only. Use --strict for a zero-finding gate or --strict --baseline-ref=<git-ref> for a no-regression ratchet.')
process.exit(0)
