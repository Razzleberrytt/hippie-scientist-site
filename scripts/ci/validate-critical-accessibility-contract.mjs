#!/usr/bin/env node

/**
 * Fail closed when the site's critical accessibility primitives regress.
 *
 * This complements axe-core component tests and the broader heuristic pattern
 * audit. It intentionally checks a small set of high-value contracts that map
 * directly to the primary user journeys: global bypass/focus behavior,
 * keyboard navigation, labeled research forms, accessible data tables, image
 * alternatives, and reduced-motion support.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')

const checks = [
  {
    file: 'app/layout.tsx',
    rules: [
      ['skip link targets main content', /href=['"]#main-content['"]/],
      ['main content has stable target', /id=['"]main-content['"]/],
      ['skip target is programmatically focusable', /tabIndex=\{-1\}/],
    ],
  },
  {
    file: 'components/Navigation.tsx',
    rules: [
      ['primary navigation has an accessible name', /aria-label=['"]Primary['"]/],
      ['expandable navigation exposes expanded state', /aria-expanded=/],
      ['expandable navigation identifies controlled content', /aria-controls=/],
      ['navigation implements keyboard handling', /onKeyDown=/],
    ],
  },
  {
    file: 'src/components/safety/SafetyCheckerClient.tsx',
    rules: [
      ['safety search has a visible label', /<label[^>]+htmlFor=['"]safety-checker-search['"]/],
      ['safety search input has matching id', /<input[^>]+id=['"]safety-checker-search['"]/],
      ['dynamic safety output announces updates', /aria-live=['"]polite['"]/],
    ],
  },
  {
    file: 'app/evidence/evidence-checker/EvidenceLookupClient.tsx',
    rules: [
      ['evidence search has a programmatic label', /<label[^>]+htmlFor=['"]evidence-lookup-search['"]/],
      ['evidence search input has matching id', /<input[\s\S]{0,300}id=['"]evidence-lookup-search['"]/],
      ['evidence filter group has an accessible name', /role=['"]group['"][^>]+aria-label=/],
      ['evidence result count is announced', /role=['"]status['"]/],
    ],
  },
  {
    file: 'components/ui/ResponsiveTable.tsx',
    rules: [
      ['responsive table exposes a keyboard-reachable region', /tabIndex=\{0\}/],
      ['responsive table region has an accessible name', /aria-label=/],
    ],
  },
  {
    file: 'styles/accessibility-wcag-22.css',
    rules: [
      ['focus-visible styling is sitewide', /:focus-visible/],
      ['forced-colors mode is supported', /forced-colors:\s*active/],
      ['reduced-motion preference is supported', /prefers-reduced-motion:\s*reduce/],
    ],
  },
]

const failures = []
for (const check of checks) {
  const absolute = path.join(ROOT, check.file)
  if (!fs.existsSync(absolute)) {
    failures.push(`${check.file}: required accessibility surface is missing`)
    continue
  }
  const source = read(check.file)
  for (const [label, pattern] of check.rules) {
    if (!pattern.test(source)) failures.push(`${check.file}: ${label}`)
  }
}

const imageFiles = [
  'app/page.tsx',
  'app/tools/page.tsx',
  'app/safety-checker/page.tsx',
  'app/evidence/evidence-report/page.tsx',
]
for (const file of imageFiles) {
  const absolute = path.join(ROOT, file)
  if (!fs.existsSync(absolute)) continue
  const source = read(file)
  for (const match of source.matchAll(/<(?:Image|img)\b[\s\S]*?>/g)) {
    if (!/\balt=/.test(match[0])) failures.push(`${file}: meaningful/decorative image is missing an explicit alt attribute`)
  }
}

if (failures.length) {
  console.error(`Accessibility contract failed with ${failures.length} issue${failures.length === 1 ? '' : 's'}:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`✓ Critical accessibility contract passed (${checks.length} surfaces + ${imageFiles.length} major-page image checks).`)
