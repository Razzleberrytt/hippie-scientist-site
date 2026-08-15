#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STRICT = process.argv.includes('--strict')
const PAGE_ROOTS = [
  path.join(ROOT, 'app', 'guides', 'compare'),
  path.join(ROOT, 'app', 'guides'),
]

const REQUIRED_PUBLIC_RESEARCH_ALLOWS = [
  '/data/ai-entities/',
  '/data/ingredients/',
  '/data/claim-knowledge-graph.json',
  '/data/research-relationship-graph.json',
]

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) return walk(full)
    return /page\.(tsx|ts|jsx|js)$/.test(name) ? [full] : []
  })
}

function routeFor(file) {
  return `/${path.relative(path.join(ROOT, 'app'), path.dirname(file)).replaceAll(path.sep, '/')}/`.replace(/\/+/g, '/')
}

function auditPage(file) {
  const source = readFileSync(file, 'utf8')
  const route = routeFor(file)
  const issues = []
  const usesSummary = /CitationReadySummary/.test(source)
  const hasQuickAnswer = usesSummary || /quick answer/i.test(source)
  const hasEvidence = usesSummary || /evidence/i.test(source)
  const hasLimitation = usesSummary || /limitation|not claiming|uncertain|caveat/i.test(source)
  const hasReferences = /referencesHref|CompareCitations|References|citation/i.test(source)
  const hasStableAnchor = usesSummary || /\bid=["'`{]/.test(source)

  if (!hasQuickAnswer) issues.push('no direct-answer signal near the top-level page source')
  if (!hasEvidence) issues.push('no evidence signal')
  if (!hasLimitation) issues.push('no limitation/caveat signal')
  if (!hasReferences) issues.push('no visible/linked citation signal')
  if (!hasStableAnchor) issues.push('no stable section/finding anchor signal')

  // FAQ sections are fine when genuinely useful; this audit only flags pages
  // that appear to rely on FAQ markup without a direct answer/evidence structure.
  if (/FaqJsonLd|FAQPage/.test(source) && !hasQuickAnswer) {
    issues.push('FAQ/schema present without a direct-answer structure; avoid FAQ-first answer-engine optimization')
  }

  return { route, file: path.relative(ROOT, file), issues }
}

function auditDiscovery() {
  const issues = []
  const llms = existsSync(path.join(ROOT, 'public', 'llms.txt'))
    ? readFileSync(path.join(ROOT, 'public', 'llms.txt'), 'utf8')
    : ''
  const robots = existsSync(path.join(ROOT, 'app', 'robots.ts'))
    ? readFileSync(path.join(ROOT, 'app', 'robots.ts'), 'utf8')
    : ''
  const licensing = path.join(ROOT, 'app', 'info', 'content-licensing', 'page.tsx')

  if (!/data\/ai-entities\/manifest\.json/.test(llms)) issues.push('llms.txt does not expose the public entity dataset manifest')
  if (!/content-licensing/.test(llms)) issues.push('llms.txt does not expose the attribution/licensing policy')
  if (!existsSync(licensing)) issues.push('content licensing/attribution policy page is missing')
  if (!/userAgent:\s*['"]\*['"]/.test(robots)) issues.push('robots policy does not intentionally allow the general public crawler class')
  if (!/['"]\/data\/['"]/.test(robots)) issues.push('robots policy no longer protects the broad private /data/ surface')

  for (const allowedPath of REQUIRED_PUBLIC_RESEARCH_ALLOWS) {
    if (!robots.includes(`'${allowedPath}'`) && !robots.includes(`"${allowedPath}"`)) {
      issues.push(`robots policy does not explicitly allow approved public research artifact: ${allowedPath}`)
    }
  }

  return issues
}

const uniqueFiles = [...new Set(PAGE_ROOTS.flatMap(walk))]
const pageResults = uniqueFiles.map(auditPage)
const problemPages = pageResults.filter((row) => row.issues.length)
const discoveryIssues = auditDiscovery()

console.log('\nAnswer-engine structure audit')
console.log('='.repeat(72))
console.log(`Pages scanned       ${pageResults.length}`)
console.log(`Pages with gaps     ${problemPages.length}`)
console.log(`Discovery gaps      ${discoveryIssues.length}`)
console.log('')

for (const row of problemPages.slice(0, 100)) {
  console.log(`${row.route} (${row.file})`)
  for (const issue of row.issues) console.log(`  - ${issue}`)
}

if (discoveryIssues.length) {
  console.log('\nPublic discovery')
  for (const issue of discoveryIssues) console.log(`  - ${issue}`)
}

if (STRICT && (problemPages.length || discoveryIssues.length)) {
  process.exit(1)
}

if (!problemPages.length && !discoveryIssues.length) {
  console.log('PASS: direct-answer structure, citation discovery, attribution, and crawler intent are present.')
} else {
  console.log('\nAdvisory by default. Use --strict only after the high-value page set has been fully migrated.')
}
