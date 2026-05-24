#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const rootDir = process.cwd()
const dataDir = path.join(rootDir, 'public', 'data')

function readJson(fileName, fallback = []) {
  const filePath = path.join(dataDir, fileName)
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function readManifest(fileName) {
  const parsed = readJson(fileName, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

function writeJson(fileName, data) {
  const filePath = path.join(dataDir, fileName)
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
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
  const hidden = /^hide$/i.test(text(record?.runtime_export_decision))
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

function isCompoundEligible(compound) {
  const reverseLookupReady = String(compound?.reverseLookupReady ?? '').trim() === 'Yes'
  const herbCount = Number.parseInt(String(compound?.herbCount ?? '').trim(), 10)
  const hasHerbCoverage = Number.isFinite(herbCount) && herbCount > 0
  const hasMechanism = text(compound?.mechanism).length > 0
  return (reverseLookupReady || hasHerbCoverage) && hasMechanism
}

function run() {
  const previousManifest = readManifest('publication-manifest.json')
  const previousHerbs = Array.isArray(previousManifest?.entities?.herbs) ? previousManifest.entities.herbs : []
  const previousCompounds = Array.isArray(previousManifest?.entities?.compounds) ? previousManifest.entities.compounds : []

  const workbookHerbs = readJson('workbook-herbs.json', [])
  const workbookCompounds = readJson('workbook-compounds.json', [])
  const herbSummaryIndex = readJson('summary-indexes/herbs-summary.json', [])

  const workbookHerbSlugSet = new Set((Array.isArray(workbookHerbs) ? workbookHerbs : []).map((row) => text(row?.slug)).filter(Boolean))

  const eligibleHerbs = (Array.isArray(herbSummaryIndex) ? herbSummaryIndex : [])
    .filter((h) => workbookHerbSlugSet.has(text(h?.slug)) && canIndex(h))
    .map((h) => ({ slug: text(h.slug), name: text(h?.name || h?.displayName || h?.slug) }))
    .filter((h) => h.slug)
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const eligibleCompounds = (Array.isArray(workbookCompounds) ? workbookCompounds : [])
    .filter((compound) => isCompoundEligible(compound))
    .map((compound) => String(compound?.id ?? compound?.canonicalCompoundId ?? '').trim())
    .filter(Boolean)
  const uniqueEligibleCompounds = [...new Set(eligibleCompounds)].sort((a, b) => a.localeCompare(b))

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'workbook+summary-indexes',
    entities: {
      herbs: eligibleHerbs,
      compounds: uniqueEligibleCompounds,
    },
    counts: {
      herbs_total: workbookHerbSlugSet.size,
      herbs_eligible: eligibleHerbs.length,
      compounds_total: Array.isArray(workbookCompounds) ? workbookCompounds.length : 0,
      compounds_eligible: uniqueEligibleCompounds.length,
    },
  }

  writeJson('publication-manifest.json', manifest)

  execFileSync('node', ['scripts/generate-indexable-herbs.mjs'], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  console.log('[publication-manifest] source=workbook+summary-indexes')
  console.log(`[publication-manifest] herbs before=${previousHerbs.length} after=${eligibleHerbs.length} delta=${eligibleHerbs.length - previousHerbs.length}`)
  console.log(`[publication-manifest] compounds before=${previousCompounds.length} after=${uniqueEligibleCompounds.length} delta=${uniqueEligibleCompounds.length - previousCompounds.length}`)
}

run()
