#!/usr/bin/env node
/**
 * Internal Linking Audit
 *
 * Scans static pages and suggests related herbs, compounds, guides, and
 * comparisons based on deterministic slug/title/effect matching.
 *
 * Always exits 0 — findings are advisory only.
 * Output: ops/reports/internal-linking-report.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ─── Scoring (mirrors lib/content-linking.ts) ─────────────────────────────────

const STOP_WORDS = new Set([
  'for', 'and', 'the', 'with', 'a', 'an', 'of', 'in', 'to', 'vs', 'or', 'on',
  'at', 'by', 'is', 'are', 'was', 'be', 'as', 'from', 'that', 'this', 'how',
  'why', 'what', 'when', 'where', 'your', 'you', 'do', 'does', 'can', 'best',
  'top', 'guide', 'natural', 'herb', 'supplement', 'herbs', 'supplements',
  'about', 'more', 'over', 'into', 'between', 'compare',
])

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[-\s_/]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
}

function scoreMatch(entityName, entitySlug, entityEffects, pageTitle, pageSlug) {
  const titleLower = pageTitle.toLowerCase()
  const pageTokens = new Set(tokenize(pageSlug))
  const entityNameLower = entityName.toLowerCase()

  let score = 0
  let reason = ''

  if (titleLower.includes(entityNameLower)) {
    score += 3
    reason = 'name in title'
  }

  const entitySlugTokens = tokenize(entitySlug)
  const overlap = entitySlugTokens.filter((t) => pageTokens.has(t))
  if (overlap.length > 0) {
    score += Math.min(overlap.length * 2, 4)
    if (!reason) reason = `slug overlap: ${overlap.join(', ')}`
  }

  for (const effect of entityEffects) {
    const effectNorm = effect.toLowerCase().replace(/_/g, ' ')
    if (titleLower.includes(effectNorm) || pageSlug.includes(effect.toLowerCase())) {
      score += 1
      if (!reason) reason = `effect: ${effect}`
      break
    }
  }

  return { score, reason }
}

function findRelatedHerbs(pageTitle, pageSlug, herbs, topN = 5) {
  const scored = []
  for (const herb of herbs) {
    if (!herb.sitemap_included) continue
    if (herb.slug === pageSlug) continue
    const effects = [...(herb.effects ?? []), ...(herb.primary_effects ?? [])]
    const { score, reason } = scoreMatch(herb.name, herb.slug, effects, pageTitle, pageSlug)
    if (score > 0) scored.push({ slug: herb.slug, name: herb.name, route: `/herbs/${herb.slug}`, matchReason: reason, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topN).map(({ score: _s, ...rest }) => rest)
}

function findRelatedCompounds(pageTitle, pageSlug, compounds, topN = 5) {
  const scored = []
  for (const compound of compounds) {
    if (!compound.sitemap_included) continue
    if (compound.slug === pageSlug) continue
    const effects = [...(compound.effects ?? []), ...(compound.primary_effects ?? [])]
    const { score, reason } = scoreMatch(compound.name, compound.slug, effects, pageTitle, pageSlug)
    if (score > 0) scored.push({ slug: compound.slug, name: compound.name, route: `/compounds/${compound.slug}`, matchReason: reason, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topN).map(({ score: _s, ...rest }) => rest)
}

function findRelatedGuides(pageTitle, pageSlug, guides, topN = 5) {
  const scored = []
  for (const guide of guides) {
    if (guide.slug === pageSlug) continue
    const { score, reason } = scoreMatch(guide.title, guide.slug, [], pageTitle, pageSlug)
    if (score > 0) scored.push({ slug: guide.slug, title: guide.title, route: `/guides/${guide.slug}`, matchReason: reason, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topN).map(({ score: _s, ...rest }) => rest)
}

function findRelatedComparisons(pageTitle, pageSlug, comparisons, topN = 5) {
  const scored = []
  for (const comparison of comparisons) {
    if (comparison.slug === pageSlug) continue
    const { score, reason } = scoreMatch(comparison.title, comparison.slug, [], pageTitle, pageSlug)
    if (score > 0) scored.push({ slug: comparison.slug, title: comparison.title, route: `/compare/${comparison.slug}`, matchReason: reason, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topN).map(({ score: _s, ...rest }) => rest)
}

// ─── Data loading ──────────────────────────────────────────────────────────────

function loadJson(relPath) {
  const abs = path.join(ROOT, relPath)
  if (!fs.existsSync(abs)) return []
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf8'))
  } catch {
    console.warn(`  [warn] Could not parse ${relPath}`)
    return []
  }
}

function loadHerbs() {
  const data = loadJson('public/data/summary-indexes/herbs-summary.json')
  return Array.isArray(data) ? data : []
}

function loadCompounds() {
  const data = loadJson('public/data/summary-indexes/compounds-summary.json')
  return Array.isArray(data) ? data : []
}

// ─── Page enumeration ──────────────────────────────────────────────────────────

const DYNAMIC_DIRS = new Set(['[slug]', '[goal]', '[id]', 'dynamic', 'style'])

function getStaticDirs(appSubdir) {
  const base = path.join(ROOT, 'app', appSubdir)
  if (!fs.existsSync(base)) return []
  return fs.readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !DYNAMIC_DIRS.has(d.name) && !d.name.startsWith('['))
    .map((d) => d.name)
}

function slugToTitle(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function collectPages() {
  const families = ['articles', 'guides', 'compare', 'goals', 'stacks']
  const pages = []

  for (const family of families) {
    const slugs = getStaticDirs(family)
    for (const slug of slugs) {
      const pagePath = path.join(ROOT, 'app', family, slug, 'page.tsx')
      if (!fs.existsSync(pagePath)) continue
      pages.push({ family, slug, route: `/${family}/${slug}` })
    }
  }

  return pages
}

function buildGuideEntries() {
  return getStaticDirs('guides').map((slug) => ({ slug, title: slugToTitle(slug) }))
}

function buildComparisonEntries() {
  return getStaticDirs('compare').map((slug) => ({ slug, title: slugToTitle(slug) }))
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('Internal Linking Audit')
  console.log('======================\n')

  console.log('Loading entity data...')
  const herbs = loadHerbs()
  const compounds = loadCompounds()
  const guides = buildGuideEntries()
  const comparisons = buildComparisonEntries()

  console.log(`  ${herbs.filter((h) => h.sitemap_included).length} indexable herbs`)
  console.log(`  ${compounds.filter((c) => c.sitemap_included).length} indexable compounds`)
  console.log(`  ${guides.length} guides`)
  console.log(`  ${comparisons.length} comparisons\n`)

  console.log('Collecting pages...')
  const pages = collectPages()
  console.log(`  ${pages.length} static pages found\n`)

  console.log('Running relationship matching...')
  let totalSuggestions = 0

  const pageResults = pages.map((page) => {
    const title = slugToTitle(page.slug)

    const relatedHerbs = findRelatedHerbs(title, page.slug, herbs)
    const relatedCompounds = findRelatedCompounds(title, page.slug, compounds)
    const relatedGuides = findRelatedGuides(title, page.slug, guides)
    const relatedComparisons = findRelatedComparisons(title, page.slug, comparisons)

    const suggestionCount =
      relatedHerbs.length + relatedCompounds.length + relatedGuides.length + relatedComparisons.length
    totalSuggestions += suggestionCount

    return {
      route: page.route,
      family: page.family,
      title,
      relatedHerbs,
      relatedCompounds,
      relatedGuides,
      relatedComparisons,
    }
  })

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      pagesAudited: pages.length,
      relationshipSuggestions: totalSuggestions,
      herbsIndexable: herbs.filter((h) => h.sitemap_included).length,
      compoundsIndexable: compounds.filter((c) => c.sitemap_included).length,
    },
    pages: pageResults,
  }

  // Write report
  const outDir = path.join(ROOT, 'ops', 'reports')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const outPath = path.join(outDir, 'internal-linking-report.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')

  console.log(`  ${totalSuggestions} total suggestions across ${pages.length} pages\n`)
  console.log(`Report written to ops/reports/internal-linking-report.json`)

  // Surface top opportunities
  const topPages = [...pageResults]
    .sort(
      (a, b) =>
        b.relatedHerbs.length +
        b.relatedCompounds.length +
        b.relatedGuides.length +
        b.relatedComparisons.length -
        (a.relatedHerbs.length +
          a.relatedCompounds.length +
          a.relatedGuides.length +
          a.relatedComparisons.length),
    )
    .slice(0, 10)

  if (topPages.length > 0) {
    console.log('\nTop linking opportunities:')
    for (const p of topPages) {
      const count =
        p.relatedHerbs.length + p.relatedCompounds.length + p.relatedGuides.length + p.relatedComparisons.length
      if (count === 0) continue
      const parts = []
      if (p.relatedHerbs.length) parts.push(`${p.relatedHerbs.length} herb${p.relatedHerbs.length > 1 ? 's' : ''}`)
      if (p.relatedCompounds.length) parts.push(`${p.relatedCompounds.length} compound${p.relatedCompounds.length > 1 ? 's' : ''}`)
      if (p.relatedGuides.length) parts.push(`${p.relatedGuides.length} guide${p.relatedGuides.length > 1 ? 's' : ''}`)
      if (p.relatedComparisons.length) parts.push(`${p.relatedComparisons.length} comparison${p.relatedComparisons.length > 1 ? 's' : ''}`)
      console.log(`  ${p.route} → ${parts.join(', ')}`)
    }
  }

  console.log('\n[audit:links] complete — exit 0 (findings are advisory)')
}

main()
process.exit(0)
