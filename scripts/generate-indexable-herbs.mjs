#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

function readJson(fileName, fallback = []) {
  const fullPath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(fullPath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(fileName, data) {
  fs.writeFileSync(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function text(value) {
  return String(value ?? '').trim()
}

function list(value) {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(item => text(item)).filter(Boolean)
  return text(value).split(/\n|;|\|/).map(item => item.trim()).filter(Boolean)
}

function coerceBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  return null
}

function canIndex(record) {
  const exportDecision = text(record?.runtime_export_decision)
  const hidden = /^hide$/i.test(exportDecision)
  if (hidden) return false

  const status = text(record?.indexability_status)
  if (/^(PUBLISH|NOINDEX|NEEDS_REVIEW|BLOCKED)$/i.test(status)) {
    return status.toUpperCase() === 'PUBLISH'
  }

  const sitemapIncluded = coerceBool(record?.sitemap_included)
  const robotsField = text(record?.robots)
  if (sitemapIncluded !== null && robotsField) {
    return sitemapIncluded && /^index/i.test(robotsField)
  }

  const profileStatus = text(record?.profile_status)
  const summaryQuality = text(record?.summary_quality)
  const evidenceTier = text(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade)
  const hasResearchPending = list(record?.primary_effects).some((effect) => /research-pending/i.test(effect))
  const indexableStatus = /^(complete|near_complete|top50_authority_patched|commercial_ready)$/i.test(profileStatus)
  const indexableQuality = !/^(weak|minimal|thin|stub|research_needed)$/i.test(summaryQuality)
  const evidenceSupported = /\b(strong|moderate|human|clinical|commercial_ready)\b/i.test(evidenceTier) || indexableStatus

  return indexableStatus && indexableQuality && evidenceSupported && !hasResearchPending
}

function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(slug))
}

function run() {
  const herbs = readJson('summary-indexes/herbs-summary.json', [])
  const compoundsManifest = readJson('publication-manifest.json', {})
  const compounds = Array.isArray(compoundsManifest?.entities?.compounds) ? compoundsManifest.entities.compounds : []

  const eligibleHerbs = (Array.isArray(herbs) ? herbs : [])
    .filter((h) => isValidSlug(h?.slug) && canIndex(h))
    .map((h) => ({
      slug: h.slug,
      name: text(h?.name || h?.displayName || h?.slug),
      title: `${text(h?.name || h?.displayName || h?.slug)} | The Hippie Scientist`,
      description: text(h?.summary || h?.description) || `${text(h?.name || h?.slug)} profile with evidence-aware summary, mechanism context, and safety notes when available.`,
    }))

  writeJson('indexable-herbs.json', eligibleHerbs)
  writeJson('indexable-compounds.json', compounds)

  console.log('[indexable] source=summary-indexes/herbs-summary.json')
  console.log(`[indexable] herbs indexable=${eligibleHerbs.length}`)
  console.log(`[indexable] compounds indexable=${compounds.length}`)
}

run()
