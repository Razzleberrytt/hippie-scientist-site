#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import {
  EDITORIAL_READINESS_REPORT_PATH,
  INPUT_PATH_DEFAULT,
  buildEditorialReadinessReport,
  parseNormalizedInput,
  validateAndNormalizeEntries,
  writeJson,
} from './enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()
const HERBS_PATH = path.join(ROOT, 'public', 'data', 'herbs.json')
const COMPOUNDS_PATH = path.join(ROOT, 'public', 'data', 'compounds.json')

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return []
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function hasRenderableEnrichmentSections(payload) {
  const enrichment = payload?.researchEnrichment
  if (!enrichment || typeof enrichment !== 'object') return false

  const claimFields = [
    'supportedUses',
    'unsupportedOrUnclearUses',
    'mechanisms',
    'constituents',
    'interactions',
    'contraindications',
    'adverseEffects',
    'dosageContextNotes',
    'populationSpecificNotes',
    'conflictNotes',
    'researchGaps',
  ]

  return claimFields.some(field => Array.isArray(enrichment[field]) && enrichment[field].length > 0)
}

function indexByEntity(records, entityType) {
  const map = new Map()
  for (const row of records) {
    const slug = normalizeSlug(row?.slug)
    if (!slug) continue
    map.set(`${entityType}:${slug}`, row)
  }
  return map
}

function run() {
  const entries = parseNormalizedInput(INPUT_PATH_DEFAULT)
  const { normalizedEntries, issues, sourceById } = validateAndNormalizeEntries(entries, {
    allowMissingEntityRefs: true,
  })

  if (issues.length > 0) {
    console.error(`[verify-enrichment-editorial] FAIL normalized validation issues=${issues.length}`)
    for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`)
    if (issues.length > 50) console.error(`- ...and ${issues.length - 50} more`)
    process.exit(1)
  }

  const readiness = buildEditorialReadinessReport(normalizedEntries, sourceById)
  writeJson(EDITORIAL_READINESS_REPORT_PATH, readiness)

  const blockedOrPartialEntities = [
    ...readiness.entitiesPartiallyEnrichedButBlocked,
    ...readiness.entitiesBlocked,
  ]

  const herbMap = indexByEntity(readJsonArray(HERBS_PATH), 'herb')
  const compoundMap = indexByEntity(readJsonArray(COMPOUNDS_PATH), 'compound')
  const entityMap = new Map([...herbMap.entries(), ...compoundMap.entries()])

  const renderViolations = []
  for (const entity of blockedOrPartialEntities) {
    const key = `${entity.entityType}:${entity.entitySlug}`
    const payload = entityMap.get(key)
    if (!payload) continue
    if (hasRenderableEnrichmentSections(payload)) {
      renderViolations.push({
        entityType: entity.entityType,
        entitySlug: entity.entitySlug,
        readinessState: entity.readinessState,
        blockedReasons: entity.blockedReasons,
      })
    }
  }

  if (renderViolations.length > 0) {
    console.error(
      `[verify-enrichment-editorial] FAIL blocked-or-partial entities still expose renderable enrichment sections=${renderViolations.length}`,
    )
    for (const violation of renderViolations.slice(0, 50)) {
      console.error(
        `- ${violation.entityType}:${violation.entitySlug} readiness=${violation.readinessState} reasons=${violation.blockedReasons.join(',')}`,
      )
    }
    process.exit(1)
  }

  console.log(
    `[verify-enrichment-editorial] PASS entries=${normalizedEntries.length} ready=${readiness.summary.entitiesReadyForEnrichedPublish} partial=${readiness.summary.entitiesPartiallyBlocked} blocked=${readiness.summary.entitiesBlocked}`,
  )
  console.log(`[verify-enrichment-editorial] report=${path.relative(ROOT, EDITORIAL_READINESS_REPORT_PATH)}`)
}

run()
