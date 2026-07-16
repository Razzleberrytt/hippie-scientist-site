#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'app')
const OUT_DIR = path.join(ROOT, 'reports')
const JSON_OUT = path.join(OUT_DIR, 'high-roi-content-opportunities.json')
const MD_OUT = path.join(OUT_DIR, 'high-roi-content-opportunities.md')

const COMMERCIAL_TERMS = [
  'best', 'top', 'review', 'reviews', 'compare', 'comparison', 'vs', 'supplement',
  'product', 'buy', 'brand', 'dose', 'dosage', 'stack', 'for sleep', 'for anxiety',
  'for focus', 'for stress', 'for adhd', 'magnesium', 'melatonin', 'ashwagandha',
]

const INTENT_WEIGHTS = {
  best: 8,
  top: 5,
  review: 7,
  reviews: 7,
  compare: 8,
  comparison: 8,
  vs: 8,
  supplement: 4,
  product: 5,
  buy: 10,
  brand: 5,
  dose: 3,
  dosage: 3,
  stack: 4,
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length
}

function routeFromFile(file) {
  const relative = path.relative(APP_DIR, path.dirname(file)).split(path.sep).join('/')
  return `/${relative}`.replace(/\/page$/, '').replace(/\/+/g, '/')
}

function scorePage(file) {
  const source = fs.readFileSync(file, 'utf8')
  const route = routeFromFile(file)
  const haystack = `${route} ${source}`.toLowerCase()

  let intentScore = 0
  for (const term of COMMERCIAL_TERMS) {
    if (!haystack.includes(term)) continue
    intentScore += INTENT_WEIGHTS[term] || 2
  }

  const hasRecommendation = /RecommendationSection|getRevenueProductSet/.test(source)
  const hasAffiliate = /affiliateUrl|amazonUrl|AFFILIATE_TAGS/.test(source)
  const hasReferences = /references|pubmed|doi\.org/i.test(source)
  const hasFaq = /FAQ|faq|Frequently Asked/i.test(source)
  const hasQuickAnswer = /Quick Answer|fastest useful choice|bottom line/i.test(source)
  const hasDecisionFramework = /decision|match supplement|best for|choose by/i.test(source)
  const hasUpdatedDate = /dateModified|Last updated/i.test(source)
  const internalLinks = countMatches(source, /<Link\s+href=/g)
  const externalEvidenceLinks = countMatches(source, /https:\/\/(?:pubmed\.ncbi\.nlm\.nih\.gov|doi\.org)/g)
  const words = source.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length

  let readinessScore = 0
  if (hasReferences) readinessScore += 8
  if (hasQuickAnswer) readinessScore += 6
  if (hasDecisionFramework) readinessScore += 6
  if (hasFaq) readinessScore += 4
  if (hasUpdatedDate) readinessScore += 3
  readinessScore += Math.min(internalLinks, 12)
  readinessScore += Math.min(externalEvidenceLinks * 2, 12)
  readinessScore += words >= 900 ? 8 : words >= 500 ? 4 : 0

  let monetizationGap = 0
  if (intentScore >= 12 && !hasRecommendation) monetizationGap += 18
  if (intentScore >= 12 && !hasAffiliate) monetizationGap += 8
  if (intentScore >= 10 && !hasDecisionFramework) monetizationGap += 6
  if (intentScore >= 10 && !hasQuickAnswer) monetizationGap += 5
  if (!hasReferences) monetizationGap += 7
  if (internalLinks < 3) monetizationGap += 5
  if (words < 500) monetizationGap += 8

  const opportunityScore = intentScore + readinessScore + monetizationGap

  const actions = []
  if (intentScore >= 12 && !hasRecommendation) actions.push('Add a context-matched RecommendationSection')
  if (intentScore >= 12 && !hasAffiliate) actions.push('Connect the page to an approved revenue product set')
  if (!hasQuickAnswer) actions.push('Add a concise answer-first block above the fold')
  if (!hasDecisionFramework) actions.push('Add a problem-to-option decision framework')
  if (!hasReferences) actions.push('Add primary evidence references')
  if (!hasFaq) actions.push('Add only genuinely useful FAQ coverage')
  if (internalLinks < 3) actions.push('Add contextual links to supporting profiles and comparisons')
  if (words < 500) actions.push('Expand thin decision-support content')

  return {
    route,
    file: path.relative(ROOT, file).split(path.sep).join('/'),
    opportunityScore,
    intentScore,
    readinessScore,
    monetizationGap,
    words,
    internalLinks,
    externalEvidenceLinks,
    hasRecommendation,
    hasAffiliate,
    hasReferences,
    hasFaq,
    hasQuickAnswer,
    hasDecisionFramework,
    hasUpdatedDate,
    actions,
  }
}

const pages = walk(APP_DIR)
  .filter((file) => file.endsWith(`${path.sep}page.tsx`))
  .map(scorePage)
  .filter((page) => page.intentScore >= 8)
  .sort((a, b) => b.opportunityScore - a.opportunityScore || a.route.localeCompare(b.route))

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(JSON_OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), pages }, null, 2)}\n`)

const top = pages.slice(0, 40)
const rows = top.map((page, index) => {
  const action = page.actions[0] || 'Protect and monitor this page'
  return `| ${index + 1} | \`${page.route}\` | ${page.opportunityScore} | ${page.intentScore} | ${page.monetizationGap} | ${page.hasRecommendation ? 'yes' : 'no'} | ${action} |`
})

const markdown = `# High-ROI content opportunities\n\nGenerated: ${new Date().toISOString()}\n\nThis report ranks existing app-router pages by commercial/search intent, evidence and decision-support readiness, and monetization gaps. It deliberately favors improving existing pages over creating more URLs.\n\n## Priority queue\n\n| Rank | Route | Opportunity | Intent | Revenue gap | Product module | First action |\n|---:|---|---:|---:|---:|:---:|---|\n${rows.join('\n')}\n\n## Scoring rule\n\n- Commercial-intent language raises the intent score.\n- Evidence, internal links, answer-first copy, decision frameworks, and sufficient depth raise readiness.\n- Missing product modules, affiliate connections, evidence, internal links, and useful depth raise the monetization-gap score.\n- A high score means the page already targets valuable intent but still has a concrete improvement path.\n\n## Execution guardrails\n\n1. Work the top five pages first.\n2. Prefer one-page, measurable upgrades over broad component rewrites.\n3. Do not add products unless the recommendation is context-matched and safety language remains intact.\n4. Re-run this report after each batch and record which gaps were actually closed.\n`

fs.writeFileSync(MD_OUT, markdown)

console.log(`Audited ${pages.length} commercially relevant pages.`)
console.log(`Wrote ${path.relative(ROOT, JSON_OUT)} and ${path.relative(ROOT, MD_OUT)}.`)
console.log('Top opportunities:')
for (const page of pages.slice(0, 10)) {
  console.log(`- ${page.opportunityScore.toString().padStart(3)} ${page.route}: ${page.actions[0] || 'monitor'}`)
}
