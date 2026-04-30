#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const rootDir = process.cwd()
const dataDir = path.join(rootDir, 'public', 'data')

function readJsonArray(fileName) {
  const filePath = path.join(dataDir, fileName)
  if (!fs.existsSync(filePath)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readManifest(fileName) {
  const filePath = path.join(dataDir, fileName)
  if (!fs.existsSync(filePath)) return {}
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function parsePercent(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return 0
  const numeric = Number.parseFloat(raw.replace('%', ''))
  return Number.isFinite(numeric) ? numeric : 0
}

function hasNonEmptyText(value) {
  return String(value ?? '').trim().length > 0
}

function toSlugMap(records) {
  const map = new Map()
  for (const record of records) {
    const slug = String(record?.slug ?? '').trim()
    if (!slug || map.has(slug)) continue
    map.set(slug, record)
  }
  return map
}

function isHerbEligible(workbookHerb) {
  // Primary gate: publicationStatus / publish_status from the workbook
  // These are the actual columns that exist in herb_monograph_master.xlsx
  const pub = String(
    workbookHerb?.publicationStatus ??
    workbookHerb?.publish_status ??
    workbookHerb?.publishStatus ??
    ''
  ).trim().toLowerCase()

  const ELIGIBLE_STATUSES = new Set([
    'publishable',
    'publish',
    'publishable_if_dosage_section_omitted',
    'near_ready',
    'near ready',
    'ready',
    'yes',
  ])

  if (ELIGIBLE_STATUSES.has(pub)) return true

  // Legacy fallback: frontendReadyFlag / readinessFlag (if ever added back to workbook)
  if (String(workbookHerb?.frontendReadyFlag ?? '').trim() === 'Yes') return true
  if (String(workbookHerb?.readinessFlag ?? '').trim() === 'Ready') return true

  // Data-quality fallback: description >= 80 chars AND has any source reference
  const desc = String(workbookHerb?.description ?? '').trim()
  const sources = String(workbookHerb?.sources ?? '').trim()
  return desc.length >= 80 && sources.length > 0
}

function isCompoundEligible(compound) {
  const reverseLookupReady = String(compound?.reverseLookupReady ?? '').trim() === 'Yes'
  const herbCount = Number.parseInt(String(compound?.herbCount ?? '').trim(), 10)
  const hasHerbCoverage = Number.isFinite(herbCount) && herbCount > 0
  const hasMechanism = hasNonEmptyText(compound?.mechanism)

  return (reverseLookupReady || hasHerbCoverage) && hasMechanism
}

function writeJson(fileName, data) {
  const filePath = path.join(dataDir, fileName)
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function run() {
  const previousManifest = readManifest('publication-manifest.json')
  const previousHerbs = Array.isArray(previousManifest?.entities?.herbs) ? previousManifest.entities.herbs : []
  const previousCompounds = Array.isArray(previousManifest?.entities?.compounds) ? previousManifest.entities.compounds : []

  const workbookHerbs = readJsonArray('workbook-herbs.json')
  const workbookCompounds = readJsonArray('workbook-compounds.json')

  const workbookHerbsBySlug = toSlugMap(workbookHerbs)
  const allHerbSlugs = [...new Set([...workbookHerbsBySlug.keys()])]
  const eligibleHerbs = allHerbSlugs
    .filter(slug => isHerbEligible(workbookHerbsBySlug.get(slug)))
    .sort((a, b) => a.localeCompare(b))

  const eligibleCompounds = workbookCompounds
    .filter(compound => isCompoundEligible(compound))
    .map(compound => String(compound?.id ?? compound?.canonicalCompoundId ?? '').trim())
    .filter(Boolean)

  const uniqueEligibleCompounds = [...new Set(eligibleCompounds)].sort((a, b) => a.localeCompare(b))

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'workbook',
    entities: {
      herbs: eligibleHerbs,
      compounds: uniqueEligibleCompounds,
    },
    counts: {
      herbs_total: allHerbSlugs.length,
      herbs_eligible: eligibleHerbs.length,
      compounds_total: workbookCompounds.length,
      compounds_eligible: uniqueEligibleCompounds.length,
    },
  }

  writeJson('publication-manifest.json', manifest)

  execFileSync('node', ['scripts/generate-indexable-herbs.mjs'], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  console.log('[publication-manifest] source=workbook')
  console.log(`[publication-manifest] herbs before=${previousHerbs.length} after=${eligibleHerbs.length} delta=${eligibleHerbs.length - previousHerbs.length}`)
  console.log(`[publication-manifest] compounds before=${previousCompounds.length} after=${uniqueEligibleCompounds.length} delta=${uniqueEligibleCompounds.length - previousCompounds.length}`)
  console.log(`[publication-manifest] totals herbs=${allHerbSlugs.length} compounds=${workbookCompounds.length}`)
}

run()
