#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const repoRoot = process.cwd()
const workbookPath = path.join(repoRoot, 'data-sources', 'herb_monograph_master.xlsx')
const dataDir = path.join(repoRoot, 'public', 'data')

function toCleanString(value) {
  const text = String(value ?? '').replace(/\bnan\b/gi, '').trim()
  return text
}

function splitList(value, pattern = /[;|]/) {
  const text = toCleanString(value)
  if (!text) return []
  return [...new Set(text.split(pattern).map(item => toCleanString(item)).filter(item => item && item.toLowerCase() !== 'nan'))]
}

function cleanScalar(value) {
  if (value == null) return ''
  if (typeof value === 'string') return toCleanString(value)
  return value
}

function dedupeBy(records, keyFn) {
  const seen = new Set()
  const output = []
  for (const record of records) {
    const key = keyFn(record)
    if (!key || seen.has(key)) continue
    seen.add(key)
    output.push(record)
  }
  return output
}

function readSheetRows(workbook, sheetName, { optional = false } = {}) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    if (optional) return []
    throw new Error(`Missing sheet: ${sheetName}`)
  }
  return XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })
}

function exportHerbs(workbook) {
  const rows = readSheetRows(workbook, 'Herb Monographs')

  const records = rows
    .map(row => ({
      slug: cleanScalar(row.slug),
      name: cleanScalar(row.name),
      scientificName: cleanScalar(row.scientificName),
      category: cleanScalar(row.category),
      plantPartUsed: cleanScalar(row.plantPartUsed),
      commonNames: splitList(row.commonNames),
      region: cleanScalar(row.region),
      summary: cleanScalar(row.summary),
      description: cleanScalar(row.description),
      mechanism: cleanScalar(row.mechanism),
      mechanismTags: splitList(row.mechanismTags),
      evidenceLevel: cleanScalar(row.evidenceLevel),
      activeCompounds: splitList(row.activeCompounds),
      markerCompounds: splitList(row.markerCompounds),
      safetyNotes: cleanScalar(row.safetyNotes),
      interactions: splitList(row.interactions),
      contraindications: splitList(row.contraindications),
      preparation: cleanScalar(row.preparation),
      dosage: cleanScalar(row.dosage),
      standardization: cleanScalar(row.standardization),
      qualityConcerns: cleanScalar(row.qualityConcerns),
      confidence: cleanScalar(row.confidence),
      publishStatus: cleanScalar(row.publishStatus),
      readinessFlag: cleanScalar(row.readinessFlag),
      frontendReadyFlag: cleanScalar(row.frontendReadyFlag),
      completenessPct: cleanScalar(row.completenessPct),
      priorityTier: cleanScalar(row.reviewPriority),
      totalScore: cleanScalar(row.totalScore),
      pathwayTargets: splitList(row.pathwayTargets),
      compound_count: cleanScalar(row.compound_count),
      pathway_count: cleanScalar(row.pathway_count),
      evidence_tier: cleanScalar(row.evidence_tier),
      sources: splitList([
        row.summaryCitations,
        row.mechanismCitations,
        row.safetyCitations,
        row.interactionCitations,
      ].filter(Boolean).join(';')),
    }))
    .filter(record => Boolean(record.publishStatus))

  return dedupeBy(records, record => record.slug || record.name)
}

function exportCompounds(workbook) {
  const rows = readSheetRows(workbook, 'Compound Master V3')
  const records = rows.map(row => ({
    id: cleanScalar(row.canonicalCompoundId),
    name: cleanScalar(row.compoundName),
    aliases: splitList(row.aliases),
    compoundClass: cleanScalar(row.compoundClass),
    mechanism: cleanScalar(row.mechanism),
    mechanismTags: splitList(row.mechanismTags),
    pathwayTargets: splitList(row.pathwayTargets),
    pharmacokinetics: cleanScalar(row.pharmacokinetics),
    safetyNotes: cleanScalar(row.safetyNotes),
    drugInteractions: cleanScalar(row.drugInteractions),
    confidence: cleanScalar(row.confidence),
    evidence: cleanScalar(row.evidence),
    sourceUrls: splitList(row.sourceUrls, /\s\|\s/),
    relatedHerbSlugs: splitList(row.relatedHerbSlugs),
    herbCount: cleanScalar(row.herbCount),
    reverseLookupReady: cleanScalar(row.reverseLookupReady),
  }))

  return dedupeBy(records, record => record.id || record.name)
}

function exportHerbCompoundMap(workbook) {
  const rows = readSheetRows(workbook, 'Herb Compound Map V3')
  const records = rows.map(row => ({
    herbSlug: cleanScalar(row.herbSlug),
    herbName: cleanScalar(row.herbName),
    rawCompound: cleanScalar(row.rawCompound),
    normalizedAtom: cleanScalar(row.normalizedAtom),
    canonicalCompoundId: cleanScalar(row.canonicalCompoundId),
    canonicalCompoundName: cleanScalar(row.canonicalCompoundName),
    v3MatchType: cleanScalar(row.v3MatchType),
    mappingTier: cleanScalar(row.mappingTier),
    mechanismTags: splitList(row.mechanismTags),
    pathwayTargets: splitList(row.pathwayTargets),
  }))

  return dedupeBy(records, record => `${record.herbSlug}::${record.canonicalCompoundId}::${record.rawCompound}`)
}

function cleanGoalValue(value) {
  if (typeof value === 'string' && value.trim().startsWith('=')) {
    return null
  }
  return cleanScalar(value)
}

function exportGoalBundles(workbook) {
  const rows = readSheetRows(workbook, 'Production Export V1', { optional: true })
  const records = rows
    .map(row => ({
      goal: cleanGoalValue(row.goal),
      rank: cleanGoalValue(row.rank),
      stack: cleanGoalValue(row.stack),
      score: cleanGoalValue(row.score),
      segment: cleanGoalValue(row.segment),
      condition_profile: cleanGoalValue(row.condition_profile),
      lineup_slot: cleanGoalValue(row.lineup_slot),
      intent: cleanGoalValue(row.intent),
      time_of_day: cleanGoalValue(row.time_of_day),
      balance_profile: cleanGoalValue(row.balance_profile),
      safety_band: cleanGoalValue(row.safety_band),
      recommendation_class: cleanGoalValue(row.recommendation_class),
      goal_winner_flag: cleanGoalValue(row.goal_winner_flag),
      tag: cleanGoalValue(row.tag),
      release_version: cleanGoalValue(row.release_version),
    }))
    .filter(record => typeof record.goal === 'string' && record.goal.trim() !== '')

  return dedupeBy(records, record => `${record.goal}::${record.rank}::${record.stack}`)
}

function writeJson(filename, records) {
  const outputPath = path.join(dataDir, filename)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`)
  console.log(`[export] ${filename}: ${records.length} records written`)
}

function main() {
  const workbook = XLSX.readFile(workbookPath)

  writeJson('workbook-herbs.json', exportHerbs(workbook))
  writeJson('workbook-compounds.json', exportCompounds(workbook))
  writeJson('workbook-herb-compound-map.json', exportHerbCompoundMap(workbook))
  writeJson('workbook-goal-bundles.json', exportGoalBundles(workbook))
}

main()
