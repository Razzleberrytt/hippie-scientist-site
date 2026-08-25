#!/usr/bin/env node
/**
 * Read-only shadow gate for published herb/compound profile quality.
 *
 * This script does not change robots, sitemap, publication decisions, or runtime
 * data. It identifies profiles that actually ship as published but show multiple
 * signals of low differentiated value, so enrichment can prioritize them before
 * any future publication-gate change is considered.
 *
 * Usage:
 *   npm run build && npm run audit:profile-publication
 *   node scripts/seo/index-quality-shadow.mjs
 *   node scripts/seo/index-quality-shadow.mjs --json
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(__filename), '..', '..')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const JSON_OUT = path.join(REPORTS_DIR, 'index-quality-shadow.json')
const MD_OUT = path.join(REPORTS_DIR, 'index-quality-shadow.md')
const PUBLICATION_TRUTH = path.join(ROOT, 'reports', 'profile-publication-truth.json')

const PUBLISHED = new Set(['PUBLISH'])
const WEAK_PROFILE = /^(partial|moderate|minimal|research_only)$/i
const STRONG_SUMMARY_QUALITY = /^(strong|moderate|medium)$/i
const WEAK_SUMMARY_QUALITY = /^(weak|minimal|thin|stub|research_needed|none)$/i

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function list(value) {
  if (Array.isArray(value)) return value.flatMap(list)
  return text(value)
    .split(/[\n|;,]+/)
    .map((item) => text(item))
    .filter(Boolean)
}

function loadJson(file) {
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

function loadProfiles() {
  const dirs = [
    ['herb', path.join(ROOT, 'public', 'data', 'herbs-detail'), path.join(ROOT, 'public', 'data', 'herb-index.json')],
    ['compound', path.join(ROOT, 'public', 'data', 'compounds-detail'), path.join(ROOT, 'public', 'data', 'compound-index.json')],
  ]
  const rows = []
  for (const [kind, dir, indexFile] of dirs) {
    if (!existsSync(dir)) continue
    const manifest = loadJson(indexFile)
    const indexRows = Array.isArray(manifest) ? manifest : manifest?.items || manifest?.data || []
    const slugs = indexRows.map((row) => row.slug).filter(Boolean)

    // Fallback to the detail directory when a generated index is unavailable.
    if (!slugs.length) {
      slugs.push(...readdirSync(dir).filter((name) => name.endsWith('.json')).map((name) => name.replace(/\.json$/, '')))
    }

    for (const slug of slugs) {
      const file = path.join(dir, `${slug}.json`)
      if (!existsSync(file)) continue
      const record = loadJson(file)
      if (record) rows.push({ kind, ...record })
    }
  }
  return rows
}

function loadFinalPublishedKeys() {
  const truth = loadJson(PUBLICATION_TRUTH)
  if (!truth || !Array.isArray(truth.profiles)) {
    throw new Error(
      '[index-quality-shadow] missing reports/profile-publication-truth.json; run the production build and npm run audit:profile-publication first',
    )
  }

  return new Set(
    truth.profiles
      .filter(
        (row) =>
          row &&
          row.slug &&
          row.kind &&
          row.publicationReason === 'published' &&
          row.sitemapEligible === true &&
          row.sitemapIncluded === true &&
          row.emittedNoindex === false,
      )
      .map((row) => `${row.kind}:${row.slug}`),
  )
}

export function scoreShadowQuality(record) {
  const summary = text(record.summary || record.description || record.short_description)
  const description = text(record.description || record.summary || record.short_description)
  const profileStatus = text(record.profileStatus || record.profile_status)
  const summaryQuality = text(record.summaryQuality || record.summary_quality)
  const claimMap = Array.isArray(record.claimMap) ? record.claimMap : Array.isArray(record.claim_map) ? record.claim_map : []
  const evidenceSources = Array.isArray(record.sources) ? record.sources : []
  const sourceCount = Number(record.evidence?.sourceCount ?? record.sourceCount ?? evidenceSources.length ?? 0)
  const traditionalUses = list(record.traditionalUses || record.traditional_uses)
  const preparation = text(record.preparation)
  const evidenceLevel = text(record.evidenceLevel || record.evidence_level || record.evidenceTier || record.evidence_tier)
  const activeCompounds = list(record.activeCompounds || record.active_compounds)
  const related = list(record.relatedHerbs || record.related_herbs || record.relatedCompounds || record.related_compounds)
  const effects = list(record.primaryActions || record.primary_effects || record.effects)
  const mechanisms = list(record.mechanisms || record.mechanism || record.mechanism_summary)
  const safety = text(record.safetyNotes || record.safety_notes || record.safety || record.safetySummary)
  const contraindications = list(record.contraindications)
  const interactions = list(record.interactions)

  const signals = []
  if (WEAK_PROFILE.test(profileStatus)) signals.push('weak-profile-status')
  if (!summaryQuality) signals.push('summary-quality-missing')
  else if (WEAK_SUMMARY_QUALITY.test(summaryQuality)) signals.push('summary-quality-weak')
  if (summary.length < 140) signals.push('summary-shallow')
  if (summary && description && summary === description) signals.push('summary-description-duplicate')
  if (claimMap.length === 0) signals.push('claim-map-empty')
  if (sourceCount < 2) signals.push('source-depth-low')
  if (!evidenceLevel) signals.push('evidence-level-missing')
  if (!preparation) signals.push('preparation-missing')
  if (!traditionalUses.length) signals.push('traditional-uses-missing')
  if (!activeCompounds.length) signals.push('active-compounds-missing')
  if (!related.length) signals.push('semantic-neighbors-missing')
  if (!effects.length) signals.push('effects-missing')
  if (!mechanisms.length) signals.push('mechanisms-missing')
  if (!safety && !contraindications.length && !interactions.length) signals.push('safety-context-missing')

  const differentiatedStrengths = [
    sourceCount >= 3,
    claimMap.length > 0,
    Boolean(evidenceLevel),
    safety.length >= 40 || contraindications.length > 0 || interactions.length > 0,
    mechanisms.length > 0,
    effects.length > 1,
    preparation.length >= 40,
    traditionalUses.length > 0,
    related.length > 0,
    activeCompounds.length > 0,
    summary.length >= 220 && summary !== description,
    STRONG_SUMMARY_QUALITY.test(summaryQuality),
  ].filter(Boolean).length

  const severeSignals = signals.filter((signal) => [
    'weak-profile-status',
    'summary-quality-missing',
    'summary-quality-weak',
    'claim-map-empty',
    'source-depth-low',
    'evidence-level-missing',
    'safety-context-missing',
  ].includes(signal))

  // Shadow-only classification. Requiring multiple independent weaknesses avoids
  // treating one missing metadata field as proof that a page lacks value.
  let shadow = 'PASS'
  if (severeSignals.length >= 3 && differentiatedStrengths <= 4) shadow = 'FAIL_SHADOW'
  else if (severeSignals.length >= 2 || signals.length >= 5) shadow = 'WATCH'

  return {
    kind: record.kind,
    slug: record.slug,
    name: record.name,
    indexabilityStatus: record.indexability_status || record.indexabilityStatus || '',
    robots: record.robots || '',
    sitemapIncluded: Boolean(record.sitemap_included),
    profileStatus,
    summaryQuality,
    sourceCount,
    claimCount: claimMap.length,
    summaryLength: summary.length,
    differentiatedStrengths,
    signals,
    severeSignals,
    shadow,
  }
}

function renderMarkdown(report) {
  const lines = [
    '# Index quality shadow report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    'This report is observation-only. It does **not** change robots, sitemap inclusion, or publication decisions.',
    `Publication truth: ${report.publicationTruth}`,
    '',
    `- Published profiles evaluated: ${report.summary.published}`,
    `- PASS: ${report.summary.pass}`,
    `- WATCH: ${report.summary.watch}`,
    `- FAIL_SHADOW: ${report.summary.failShadow}`,
    '',
    '## Highest-priority shadow failures',
    '',
    '| Profile | Type | Sources | Claims | Signals |',
    '| --- | --- | ---: | ---: | --- |',
  ]
  for (const row of report.failures.slice(0, 100)) {
    lines.push(`| ${row.slug} | ${row.kind} | ${row.sourceCount} | ${row.claimCount} | ${row.severeSignals.join(', ')} |`)
  }
  lines.push('', '## Interpretation', '', '- `FAIL_SHADOW` means multiple independent low-value signals agree; it is an enrichment priority, not an automatic noindex decision.', '- `WATCH` means the profile has enough weakness to monitor but not enough evidence for a strong demotion hypothesis.', '- Future activation of any publication gate should happen only after shadow counts and search-engine outcomes are reviewed.', '')
  return lines.join('\n')
}

export function buildShadowReport(profiles, generatedAt = new Date().toISOString(), finalPublishedKeys = null) {
  const scored = profiles.map(scoreShadowQuality)
  const published = finalPublishedKeys
    ? scored.filter((row) => finalPublishedKeys.has(`${row.kind}:${row.slug}`))
    : scored.filter((row) => PUBLISHED.has(row.indexabilityStatus) && row.robots !== 'noindex,nofollow' && row.sitemapIncluded)

  const failures = published
    .filter((row) => row.shadow === 'FAIL_SHADOW')
    .sort((a, b) => b.severeSignals.length - a.severeSignals.length || a.differentiatedStrengths - b.differentiatedStrengths || a.slug.localeCompare(b.slug))
  const watch = published.filter((row) => row.shadow === 'WATCH')
  const pass = published.filter((row) => row.shadow === 'PASS')

  return {
    generatedAt,
    mode: 'shadow-only',
    publicationMutation: false,
    publicationTruth: finalPublishedKeys ? 'reports/profile-publication-truth.json' : 'provisional-record-flags',
    summary: {
      published: published.length,
      pass: pass.length,
      watch: watch.length,
      failShadow: failures.length,
    },
    failures,
    watch,
  }
}

function main() {
  const finalPublishedKeys = loadFinalPublishedKeys()
  const report = buildShadowReport(loadProfiles(), new Date().toISOString(), finalPublishedKeys)
  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_OUT, renderMarkdown(report))

  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else {
    console.log(`Index quality shadow: ${report.summary.published} published | ${report.summary.pass} PASS | ${report.summary.watch} WATCH | ${report.summary.failShadow} FAIL_SHADOW`)
    console.log(`Report: ${path.relative(ROOT, JSON_OUT)}`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) main()
