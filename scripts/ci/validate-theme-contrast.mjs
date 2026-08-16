#!/usr/bin/env node
/**
 * Fail the build when text would be unreadable in one of the two themes.
 *
 * Both themes render the same markup. A fixed neutral like `text-slate-700` is
 * chosen for the light theme and keeps that colour in dark mode, where the page
 * background is `--bg: #0d1712`:
 *
 *   text-slate-950 on the dark page background   1.02:1
 *   text-slate-700 on the dark page background   1.77:1
 *
 * AA needs 4.5:1 for body text. Two whole pages shipped with invisible
 * headings before this check existed.
 *
 * The rule is narrow on purpose, because the codebase has three legitimate
 * patterns that look similar and must not be flagged:
 *
 *   1. The element sets its own light background (`bg-white`, `bg-amber-50`).
 *      Dark text on it stays readable in both themes. Milder inconsistency,
 *      not a readability failure.
 *   2. A `dark:` variant is present, which is the explicit fix.
 *   3. A `print:` variant, which targets paper and is correctly dark-on-white.
 *
 * So this only reports text that is dark, fixed, and sitting on whatever the
 * page background happens to be.
 *
 * Usage: node scripts/ci/validate-theme-contrast.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'theme-contrast.json')

/** Directories whose components actually render in production. */
const SCAN_DIRS = ['app', 'components', 'src/components']

/** Tailwind neutral steps dark enough to vanish on the dark background. */
const FIXED_DARK_TEXT = /(?<!\w[:-])\btext-(?:slate|gray|zinc|neutral|stone)-(?:[5-9]00|950)\b/

/** Any background that keeps the element light, so dark text stays readable. */
const OWN_LIGHT_BG =
  /\bbg-(?:white|(?:slate|gray|zinc|neutral|stone|emerald|amber|blue|rose|red|green|indigo|purple|teal|sky|orange|lime|cyan|violet|fuchsia|pink)-(?:50|100|200))\b/

function walk(dir, out = []) {
  const full = path.join(ROOT, dir)
  if (!fs.existsSync(full)) return out
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!/node_modules|__tests__|\.next/.test(rel)) walk(rel, out)
    } else if (/\.tsx$/.test(entry.name)) out.push(rel)
  }
  return out
}

/**
 * Files under src/components that nothing in the app tree references are
 * legacy and never render, so a defect there is not user-visible.
 */
function buildReachability() {
  const consumerSource = [...walk('app'), ...walk('components')]
    .map((file) => fs.readFileSync(path.join(ROOT, file), 'utf8'))
    .join('\n')
  return (file) => {
    if (!file.startsWith(path.join('src', 'components')) && !file.startsWith('src/components')) return true
    const base = path.basename(file, '.tsx')
    return new RegExp(`\\b${base}\\b`).test(consumerSource)
  }
}

function main() {
  const isReachable = buildReachability()
  const findings = []
  let scanned = 0

  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      if (!isReachable(file)) continue
      scanned += 1
      const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n')
      lines.forEach((line, index) => {
        for (const match of line.matchAll(/className=["'`]([^"'`]{0,900})["'`]/g)) {
          const cls = match[1]
          if (/\bdark:text-/.test(cls)) continue
          // Drop variant-prefixed occurrences so print:/hover: forms do not count.
          const bare = cls.replace(/\b[a-z-]+:text-(?:slate|gray|zinc|neutral|stone)-(?:[5-9]00|950)\b/g, '')
          if (!FIXED_DARK_TEXT.test(bare)) continue
          if (OWN_LIGHT_BG.test(bare)) continue
          findings.push({
            file: file.replace(/\\/g, '/'),
            line: index + 1,
            classes: (bare.match(new RegExp(FIXED_DARK_TEXT, 'g')) ?? []).join(' '),
            excerpt: cls.slice(0, 100),
          })
        }
      })
    }
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), filesScanned: scanned, findings }, null, 2)}\n`,
  )

  console.log('\nTheme contrast')
  console.log('='.repeat(66))
  console.log(`Rendering files scanned   ${scanned}`)
  console.log(`Unreadable in dark mode   ${findings.length}`)

  if (!findings.length) {
    console.log('\nNo text relies on a fixed colour that disappears in dark mode.')
    return
  }

  console.error(`\n[theme-contrast] FAILED — ${findings.length} element(s) would be unreadable in dark mode.\n`)
  for (const finding of findings.slice(0, 25)) {
    console.error(`  ${finding.file}:${finding.line}  [${finding.classes}]`)
    console.error(`      ${finding.excerpt}`)
  }
  if (findings.length > 25) console.error(`  … and ${findings.length - 25} more`)
  console.error('\nUse the theme tokens instead: text-ink for headings, text-muted for body.')
  console.error('They invert with the theme, so the same markup reads in both.')
  process.exit(1)
}

main()
