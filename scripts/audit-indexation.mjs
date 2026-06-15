#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SITE_URL = 'https://www.thehippiescientist.net'
const SITEMAP_CAP = 450

function readJson(relativePath, fallback) {
  const filePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function parseStringArrayFromTs(relativePath, exportName) {
  const filePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(filePath)) return []
  const src = fs.readFileSync(filePath, 'utf8')
  const match = src.match(new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s+const`))
  if (!match) return []
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1])
}

function normalizePath(value) {
  if (!value) return '/'
  let raw = String(value)
  try {
    if (/^https?:\/\//i.test(raw)) raw = new URL(raw).pathname
  } catch {
    // Keep raw value.
  }
  raw = raw.split(/[?#]/)[0] || '/'
  raw = raw.startsWith('/') ? raw : `/${raw}`
  return raw.length > 1 ? raw.replace(/\/+$/, '') : '/'
}

function parseSitemapUrls() {
  const candidates = ['out/sitemap.xml', 'public/sitemap.xml']
  const sitemapPath = candidates.map((candidate) => path.join(ROOT, candidate)).find((candidate) => fs.existsSync(candidate))
  if (!sitemapPath) return { sitemapPath: null, urls: [] }
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim())
  return { sitemapPath, urls }
}

function text(record, fields) {
  return fields
    .flatMap((field) => {
      const value = record?.[field]
      return Array.isArray(value) ? value : [value]
    })
    .map((value) => String(value ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .trim()
}

function noindexReason(record) {
  if (!record) return null
  if (record.sitemap_included === false || String(record.sitemap_included).toLowerCase() === 'false') return 'sitemap_included=false'
  if (String(record.robots || '').toLowerCase().includes('noindex')) return 'robots=noindex'
  const indexabilityStatus = String(record.indexability_status || '').toUpperCase()
  if (['NOINDEX', 'NEEDS_REVIEW', 'BLOCKED'].includes(indexabilityStatus)) return `indexability_status=${indexabilityStatus}`
  const decision = String(record.runtime_export_decision || '').toLowerCase()
  if (['hide', 'hidden', 'blocked', 'block', 'alias_redirect_only', 'hidden_until_grounded', 'research_archive_runtime'].includes(decision)) {
    return `runtime_export_decision=${decision}`
  }
  const profileStatus = String(record.profile_status || '').toLowerCase()
  if (['draft', 'archived', 'minimal', 'research_only'].includes(profileStatus)) return `profile_status=${profileStatus}`
  const summaryQuality = String(record.summary_quality || '').toLowerCase()
  if (['weak', 'minimal', 'thin', 'stub', 'research_needed', 'none'].includes(summaryQuality)) return `summary_quality=${summaryQuality}`
  return null
}

function qualityGate(record) {
  const noindex = noindexReason(record)
  if (noindex) return { pass: false, reason: noindex }
  const profileStatus = String(record?.profile_status || '').toLowerCase()
  const evidenceTier = String(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade || '').toLowerCase()
  const hasTopTierSignal =
    /^(complete|near_complete|top50_authority_patched|commercial_ready)$/.test(profileStatus) ||
    /\b(strong|moderate)\s+human\s+evidence\b/.test(evidenceTier) ||
    /\b(strong|moderate)\b/.test(evidenceTier)
  if (!hasTopTierSignal) return { pass: false, reason: 'missing-top-tier-profile-or-human-evidence-signal' }
  if (!text(record, ['title', 'name', 'displayName', 'compoundName', 'canonicalCompoundName'])) {
    return { pass: false, reason: 'missing-name' }
  }
  const summary = text(record, ['summary', 'overview', 'description', 'generated_description', 'short_earthy_summary', 'meta_description'])
  if (summary.length < 250) return { pass: false, reason: `summary-too-short:${summary.length}` }
  const supporting = text(record, [
    'safety', 'safetyNotes', 'safety_notes', 'evidence', 'evidence_summary', 'evidence_tier', 'evidenceTier',
    'evidence_grade', 'mechanisms', 'primary_mechanisms', 'pathways', 'dosage', 'dosing', 'dose',
    'clinicalUse', 'clinical_use', 'primary_effects', 'effects', 'useContexts',
  ])
  if (!supporting) return { pass: false, reason: 'missing-safety-evidence-mechanism-dosage-or-use-field' }
  const links = text(record, ['related', 'relatedHerbs', 'relatedCompounds', 'sourceHerbs', 'compounds', 'active_compounds', 'mechanisms', 'primary_effects', 'effects'])
  if (!links) return { pass: false, reason: 'missing-internal-link-signals' }
  return { pass: true, reason: 'generated-profile-quality-gate' }
}

function profileDecision(kind, record, allowlist) {
  const slug = String(record?.slug || '')
  if (!slug) return { index: false, reason: 'missing-slug' }
  const noindex = noindexReason(record)
  const hardNoindex = noindex && /^(sitemap_included|robots|indexability_status|runtime_export_decision)=/.test(noindex)
  if (hardNoindex) return { index: false, reason: hardNoindex }
  if (allowlist.has(slug)) return { index: true, reason: `curated-${kind}-allowlist` }
  if (noindex) return { index: false, reason: noindex }
  const gate = qualityGate(record)
  return gate.pass ? { index: true, reason: gate.reason } : { index: false, reason: gate.reason }
}

function main() {
  const herbAllowlist = new Set(parseStringArrayFromTs('src/lib/index-allowlist.ts', 'CURATED_INDEXABLE_HERB_SLUGS'))
  const compoundAllowlist = new Set(parseStringArrayFromTs('src/lib/index-allowlist.ts', 'CURATED_INDEXABLE_COMPOUND_SLUGS'))
  const coreRoutes = parseStringArrayFromTs('src/lib/index-allowlist.ts', 'CORE_INDEXABLE_ROUTES')
  const moneyRoutes = parseStringArrayFromTs('src/lib/index-allowlist.ts', 'MONEY_ENTRY_ROUTES')
  const herbs = readJson('public/data/herbs.json', [])
  const compounds = readJson('public/data/compounds.json', [])
  const { sitemapPath, urls } = parseSitemapUrls()
  const sitemapPaths = new Set(urls.map(normalizePath))

  const herbDecisions = herbs.map((record) => ({ kind: 'herb', slug: record.slug, path: `/herbs/${record.slug}`, ...profileDecision('herb', record, herbAllowlist) }))
  const compoundDecisions = compounds.map((record) => ({ kind: 'compound', slug: record.slug, path: `/compounds/${record.slug}`, ...profileDecision('compound', record, compoundAllowlist) }))
  const generatedDecisions = [...herbDecisions, ...compoundDecisions]

  const noindexInSitemap = generatedDecisions.filter((item) => !item.index && sitemapPaths.has(normalizePath(item.path)))
  const sitemapNonCanonical = urls.filter((url) => !url.startsWith(`${SITE_URL}/`))

  const summary = {
    sitemapSource: sitemapPath ? path.relative(ROOT, sitemapPath) : 'missing',
    totalSitemapUrls: urls.length,
    indexableRoutes: coreRoutes.length + moneyRoutes.length + generatedDecisions.filter((item) => item.index).length,
    noindexRoutes: generatedDecisions.filter((item) => !item.index).length,
    generatedHerbPagesIncluded: herbDecisions.filter((item) => item.index && sitemapPaths.has(normalizePath(item.path))).length,
    generatedCompoundPagesIncluded: compoundDecisions.filter((item) => item.index && sitemapPaths.has(normalizePath(item.path))).length,
    excludedGeneratedPages: generatedDecisions.filter((item) => !item.index).length,
    sitemapCap: SITEMAP_CAP,
    warnings: [
      ...(urls.length > SITEMAP_CAP ? [`sitemap URL count ${urls.length} exceeds intended cap ${SITEMAP_CAP}`] : []),
      ...(noindexInSitemap.length ? [`sitemap includes ${noindexInSitemap.length} noindex generated URLs`] : []),
      ...(sitemapNonCanonical.length ? [`sitemap includes ${sitemapNonCanonical.length} non-www/non-canonical URLs`] : []),
    ],
  }

  console.log('[seo:audit] Indexation summary')
  console.table(summary)

  if (summary.warnings.length) {
    console.log('\n[seo:audit] Warnings')
    summary.warnings.forEach((warning) => console.warn(`- ${warning}`))
  }

  const excluded = generatedDecisions
    .filter((item) => !item.index)
    .map(({ kind, slug, reason }) => ({ kind, slug, reason }))

  console.log(`\n[seo:audit] Excluded generated pages (${excluded.length})`)
  excluded.slice(0, 120).forEach((item) => console.log(`- ${item.kind}:${item.slug} - ${item.reason}`))
  if (excluded.length > 120) console.log(`- ... ${excluded.length - 120} more omitted from console output`)

  const reportDir = path.join(ROOT, 'reports')
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(
    path.join(reportDir, 'indexation-audit.json'),
    JSON.stringify({ summary, noindexInSitemap, excludedGeneratedPages: excluded }, null, 2),
    'utf8',
  )

  if (noindexInSitemap.length || sitemapNonCanonical.length) {
    process.exit(1)
  }
}

main()
