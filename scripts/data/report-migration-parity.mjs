#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const INPUTS = {
  currentHerbs: path.join(repoRoot, 'public', 'data', 'herbs.json'),
  currentCompounds: path.join(repoRoot, 'public', 'data', 'compounds.json'),
  nextHerbs: path.join(repoRoot, 'public', 'data-next', 'herbs.json'),
  nextCompounds: path.join(repoRoot, 'public', 'data-next', 'compounds.json'),
}

const OUTPUTS = {
  json: path.join(repoRoot, 'reports', 'data-next-parity-report.json'),
  md: path.join(repoRoot, 'reports', 'data-next-parity-report.md'),
}

const REQUIRED_FIELDS = {
  herbs: ['name', 'slug', 'summary'],
  compounds: ['name', 'slug', 'summary'],
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(repoRoot, filePath)}`)
  }

  let parsed
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(repoRoot, filePath)}: ${error.message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array JSON in ${path.relative(repoRoot, filePath)}`)
  }

  return parsed
}

function normalizeSlug(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim().toLowerCase()
}

function findDuplicateSlugs(records) {
  const counts = new Map()
  for (const record of records) {
    const slug = normalizeSlug(record?.slug)
    if (!slug) continue
    counts.set(slug, (counts.get(slug) || 0) + 1)
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug, count]) => ({ slug, count }))
}

function buildSlugSet(records) {
  return new Set(records.map(record => normalizeSlug(record?.slug)).filter(Boolean))
}

function diffSlugSets(currentSet, nextSet) {
  const missingInNext = Array.from(currentSet).filter(slug => !nextSet.has(slug)).sort()
  const extraInNext = Array.from(nextSet).filter(slug => !currentSet.has(slug)).sort()
  return { missingInNext, extraInNext }
}

function assessRequiredFields(records, requiredFields) {
  const missingByField = {}
  for (const field of requiredFields) {
    missingByField[field] = []
  }

  for (const record of records) {
    const slug = normalizeSlug(record?.slug) || '(missing-slug)'
    for (const field of requiredFields) {
      const value = record?.[field]
      const missing =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)

      if (missing) {
        missingByField[field].push(slug)
      }
    }
  }

  const totals = {}
  for (const field of requiredFields) {
    totals[field] = {
      missingCount: missingByField[field].length,
      completeCount: Math.max(records.length - missingByField[field].length, 0),
    }
  }

  return { totals, missingByField }
}

function buildEntityParity(entityName, currentRecords, nextRecords) {
  const currentSet = buildSlugSet(currentRecords)
  const nextSet = buildSlugSet(nextRecords)
  const { missingInNext, extraInNext } = diffSlugSets(currentSet, nextSet)

  return {
    entity: entityName,
    counts: {
      current: currentRecords.length,
      next: nextRecords.length,
      delta: nextRecords.length - currentRecords.length,
    },
    slugSets: {
      currentUnique: currentSet.size,
      nextUnique: nextSet.size,
      missingInNextCount: missingInNext.length,
      extraInNextCount: extraInNext.length,
      missingInNext,
      extraInNext,
    },
    requiredFields: {
      current: assessRequiredFields(currentRecords, REQUIRED_FIELDS[entityName]),
      next: assessRequiredFields(nextRecords, REQUIRED_FIELDS[entityName]),
    },
    duplicateSlugs: {
      current: findDuplicateSlugs(currentRecords),
      next: findDuplicateSlugs(nextRecords),
    },
  }
}

function writeOutputs(report) {
  fs.mkdirSync(path.dirname(OUTPUTS.json), { recursive: true })
  fs.writeFileSync(OUTPUTS.json, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Data-next parity report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Counts',
    '',
    '| Entity | Current | Data-next | Delta |',
    '|---|---:|---:|---:|',
    `| Herbs | ${report.herbs.counts.current} | ${report.herbs.counts.next} | ${report.herbs.counts.delta} |`,
    `| Compounds | ${report.compounds.counts.current} | ${report.compounds.counts.next} | ${report.compounds.counts.delta} |`,
    '',
    '## Slug parity',
    '',
    `- Herbs missing in data-next: ${report.herbs.slugSets.missingInNextCount}`,
    `- Herbs extra in data-next: ${report.herbs.slugSets.extraInNextCount}`,
    `- Compounds missing in data-next: ${report.compounds.slugSets.missingInNextCount}`,
    `- Compounds extra in data-next: ${report.compounds.slugSets.extraInNextCount}`,
    '',
    '## Required field gaps (data-next)',
    '',
    `- Herbs: ${Object.entries(report.herbs.requiredFields.next.totals)
      .map(([field, stats]) => `${field} missing=${stats.missingCount}`)
      .join(', ')}`,
    `- Compounds: ${Object.entries(report.compounds.requiredFields.next.totals)
      .map(([field, stats]) => `${field} missing=${stats.missingCount}`)
      .join(', ')}`,
    '',
    '## Duplicate slug counts',
    '',
    `- Herbs current/data-next: ${report.herbs.duplicateSlugs.current.length}/${report.herbs.duplicateSlugs.next.length}`,
    `- Compounds current/data-next: ${report.compounds.duplicateSlugs.current.length}/${report.compounds.duplicateSlugs.next.length}`,
    '',
  ].join('\n')

  fs.writeFileSync(OUTPUTS.md, `${md}\n`, 'utf8')
}

function printSummary(report) {
  console.log('[parity] Data-next migration parity summary')
  console.log(`- herbs current=${report.herbs.counts.current} next=${report.herbs.counts.next} delta=${report.herbs.counts.delta}`)
  console.log(`- compounds current=${report.compounds.counts.current} next=${report.compounds.counts.next} delta=${report.compounds.counts.delta}`)
  console.log(
    `- slug gaps herbs missing=${report.herbs.slugSets.missingInNextCount} extra=${report.herbs.slugSets.extraInNextCount}; compounds missing=${report.compounds.slugSets.missingInNextCount} extra=${report.compounds.slugSets.extraInNextCount}`,
  )
  console.log(
    `- duplicate slug groups herbs current/next=${report.herbs.duplicateSlugs.current.length}/${report.herbs.duplicateSlugs.next.length}; compounds current/next=${report.compounds.duplicateSlugs.current.length}/${report.compounds.duplicateSlugs.next.length}`,
  )
  console.log(`- wrote ${path.relative(repoRoot, OUTPUTS.json)}`)
  console.log(`- wrote ${path.relative(repoRoot, OUTPUTS.md)}`)
}

function run() {
  const currentHerbs = readJsonArray(INPUTS.currentHerbs)
  const currentCompounds = readJsonArray(INPUTS.currentCompounds)
  const nextHerbs = readJsonArray(INPUTS.nextHerbs)
  const nextCompounds = readJsonArray(INPUTS.nextCompounds)

  const report = {
    generatedAt: new Date().toISOString(),
    herbs: buildEntityParity('herbs', currentHerbs, nextHerbs),
    compounds: buildEntityParity('compounds', currentCompounds, nextCompounds),
  }

  writeOutputs(report)
  printSummary(report)
}

run()
