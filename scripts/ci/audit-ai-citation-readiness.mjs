#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const COMPARE_DIR = path.join(ROOT, 'app', 'guides', 'compare')

const REQUIRED_MELATONIN_HEADINGS = [
  'Melatonin vs magnesium: quick answer',
  'Magnesium glycinate vs melatonin: the core difference',
  'Can you take magnesium and melatonin together?',
  'Side effects: melatonin vs magnesium',
  'Which is better for staying asleep?',
]

function readComparePages(dir = COMPARE_DIR, prefix = '') {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return []
    if (/^\[/.test(entry.name)) return []

    const childDir = path.join(dir, entry.name)
    const pageFile = path.join(childDir, 'page.tsx')
    const slug = prefix ? `${prefix}/${entry.name}` : entry.name

    return [
      ...(existsSync(pageFile) ? [{ slug, file: pageFile }] : []),
      ...readComparePages(childDir, slug),
    ]
  })
}

function hasCanonicalComparePath(source, slug) {
  const canonicalPath = `/guides/compare/${slug}/`
  const canonicalNoSlash = `/guides/compare/${slug}`
  return source.includes(canonicalPath) || source.includes(canonicalNoSlash)
}

function hasNoncanonicalCompareLink(source) {
  return /href=(?:{)?["'`]\/compare(?:\/|["'`])/.test(source) || /url:\s*["'`]https:\/\/thehippiescientist\.net\/compare(?:\/|["'`])/.test(source)
}

function auditPage({ slug, file }) {
  const source = readFileSync(file, 'utf8')
  const warnings = []

  if (!hasCanonicalComparePath(source, slug)) warnings.push('missing explicit /guides/compare/* canonical path')
  if (!/<h1[\s>]/.test(source)) warnings.push('missing visible H1')
  if (!/CitationReadySummary|Quick answer|quick answer/i.test(source)) warnings.push('missing quick-answer or citation summary signal')
  if (!/References|CompareCitations/.test(source)) warnings.push('missing visible references/citations component')
  if (!/AuthorityJsonLd|CompareSchema|JsonLd|SchemaGraphScript/.test(source)) warnings.push('missing JSON-LD/schema component')
  if (!/\/info\/methodology|\/info\/disclaimer|\/safety-checker|\/info\/dosing/.test(source)) warnings.push('missing methodology/disclaimer/safety/dosing support link')
  if (!/\/guides\/compare\//.test(source)) warnings.push('missing canonical internal link to /guides/compare/')
  if (hasNoncanonicalCompareLink(source)) warnings.push('contains noncanonical /compare link; prefer /guides/compare/')
  if (/AggregateRating|['"]@type['"]\s*:\s*['"]Review['"]/.test(source)) {
    warnings.push('contains rating/review schema term; verify this is not fake AggregateRating/Review markup')
  }

  if (slug === 'melatonin-vs-magnesium') {
    for (const heading of REQUIRED_MELATONIN_HEADINGS) {
      if (!source.includes(heading)) warnings.push(`missing Bing grounding-query heading: ${heading}`)
    }
  }

  return { slug, file: path.relative(ROOT, file), warnings }
}

const pages = readComparePages()
const results = pages.map(auditPage)
const warned = results.filter((result) => result.warnings.length > 0)

console.log(`[audit-ai-citations] scanned ${results.length} compare page(s) under app/guides/compare`)

if (!warned.length) {
  console.log('[audit-ai-citations] advisory PASS: no citation-readiness warnings found.')
  process.exit(0)
}

console.log(`[audit-ai-citations] advisory warnings: ${warned.length} page(s) need review.`)
for (const result of warned) {
  console.log(`\n- /guides/compare/${result.slug}/ (${result.file})`)
  for (const warning of result.warnings) console.log(`  - ${warning}`)
}

console.log('\n[audit-ai-citations] Advisory only; not failing CI yet.')
