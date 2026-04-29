#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  claims: 'Claim Rows',
  herbCompoundMap: 'Herb Compound Map V3',
}

const VALID_EVIDENCE_GRADES = new Set(['A', 'B', 'C'])

function parseArgs(argv) {
  const args = argv.slice(2)
  let outDir = 'public/data'

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--out') {
      outDir = args[i + 1] || ''
      i += 1
    } else if (args[i].startsWith('--out=')) {
      outDir = args[i].slice('--out='.length)
    }
  }

  if (!String(outDir).trim()) {
    throw new Error('[data] Missing --out value')
  }

  return path.resolve(repoRoot, outDir)
}

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function toSlug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toNumber(value) {
  const raw = clean(value)
  if (!raw) return null
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : null
}

function getFirst(row, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = clean(row[key])
      if (value) return value
    }
  }
  return ''
}

function splitList(value) {
  const raw = clean(value)
  if (!raw) return []
  return raw
    .split(/[;,|]/)
    .map(item => clean(item))
    .filter(Boolean)
}

function getList(row, keys) {
  return splitList(getFirst(row, keys))
}

function isUsefulRow(row) {
  return Object.values(row).some(value => clean(value))
}

function readSheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`[data] Missing required sheet: ${sheetName}`)
  }

  return XLSX.utils
    .sheet_to_json(sheet, {
      defval: '',
      raw: false,
      blankrows: false,
    })
    .filter(isUsefulRow)
}

function normalizeEvidenceGrade(value) {
  const raw = clean(value).toUpperCase()

  if (raw === 'A' || raw === 'A-TIER' || raw === 'PROMOTE_A') return 'A'
  if (raw === 'B' || raw === 'B-TIER' || raw === 'KEEP_B' || raw === 'MODERATE') return 'B'
  if (raw === 'C' || raw === 'LIMITED' || raw === 'WEAK') return 'C'

  return raw || ''
}

function deriveBenefitScore(evidenceGrade, existingValue) {
  const existing = toNumber(existingValue)
  if (existing !== null) return existing

  const grade = normalizeEvidenceGrade(evidenceGrade)
  if (grade === 'A') return 80
  if (grade === 'B') return 60
  if (grade === 'C') return 40
  return null
}

function deriveRiskScore(row) {
  const existing = toNumber(getFirst(row, ['risk_score', 'riskScore']))
  if (existing !== null) return existing

  const text = [
    getFirst(row, ['safety_notes', 'safetyNotes']),
    getFirst(row, ['contraindications', 'contraindications_interactions']),
    getFirst(row, ['interactions']),
  ]
    .join(' ')
    .toLowerCase()

  if (
    text.includes('hepatotoxic') ||
    text.includes('contraindicated') ||
    text.includes('pregnancy') ||
    text.includes('many medications')
  ) {
    return 60
  }

  if (
    text.includes('caution') ||
    text.includes('interaction') ||
    text.includes('anticoagulant') ||
    text.includes('sedative') ||
    text.includes('hypoglycemia') ||
    text.includes('bleeding')
  ) {
    return 40
  }

  return 20
}

function normalizeEntityRow(row, type) {
  const slug = toSlug(
    getFirst(row, [
      'slug',
      `${type}_slug`,
      `${type}Slug`,
      `${type}_id`,
      'canonical_slug',
      'canonicalSlug',
      'name',
    ]),
  )

  const name = getFirst(row, ['name', `${type}_name`, `${type}Name`, 'title'])

  const evidenceGrade = normalizeEvidenceGrade(
    getFirst(row, ['evidence_grade', 'evidenceGrade', 'grade', 'promotion_verdict']),
  )

  const benefitScore = deriveBenefitScore(
    evidenceGrade,
    getFirst(row, ['benefit_score', 'benefitScore']),
  )
  const riskScore = deriveRiskScore(row)
  const explicitNetScore = toNumber(getFirst(row, ['net_score', 'netScore']))
  const netScore =
    explicitNetScore !== null
      ? explicitNetScore
      : benefitScore !== null && riskScore !== null
        ? benefitScore - riskScore
        : null

  return {
    ...row,
    slug,
    name,
    evidence_grade: evidenceGrade || null,
    primary_effects: getList(row, ['primary_effects', 'primaryEffects', 'targets']),
    secondary_effects: getList(row, ['secondary_effects', 'secondaryEffects']),
    goal_tags: getList(row, ['goal_tags', 'goalTags', 'targets']),
    mechanism_targets: getList(row, ['mechanism_targets', 'mechanismTargets']),
    benefit_score: benefitScore,
    risk_score: riskScore,
    net_score: netScore,
  }
}

function isBlankClaimRow(row) {
  const usefulKeys = [
    'target_slug',
    'herb_slug',
    'compound_slug',
    'entity_slug',
    'slug',
    'claim',
    'claim_text',
    'pmid',
    'doi',
    'url',
  ]

  return usefulKeys.every(key => !clean(row[key]))
}

function getClaimTargetSlug(row) {
  return toSlug(
    getFirst(row, [
      'target_slug',
      'herb_slug',
      'compound_slug',
      'entity_slug',
      'slug',
      'targetSlug',
      'entitySlug',
    ]),
  )
}

function normalizeClaimRow(row) {
  const targetSlug = getClaimTargetSlug(row)
  const evidenceGrade = normalizeEvidenceGrade(
    getFirst(row, ['evidence_grade', 'evidenceGrade', 'evidence_level', 'grade']),
  )

  return {
    ...row,
    target_slug: targetSlug,
    evidence_grade: evidenceGrade || null,
    claim:
      getFirst(row, ['claim', 'claim_text', 'claimText']) ||
      getFirst(row, ['quoted_evidence', 'source_title']),
    domain: getFirst(row, ['domain', 'claim_domain', 'primary_domain']),
    population: getFirst(row, ['population', 'population_context', 'population_tags']),
    dosage: getFirst(row, ['dosage', 'dosage_range', 'minimum_effective_dose']),
    effect_size: getFirst(row, ['effect_size', 'effectSize']),
    pmid: clean(getFirst(row, ['pmid', 'PMID'])).replace(/^PMID:\s*/i, ''),
    doi: getFirst(row, ['doi', 'DOI']),
    url: getFirst(row, ['url', 'source_url']),
    confidence: getFirst(row, ['confidence', 'confidence_flag']) || null,
  }
}

function normalizeMapRow(row) {
  return {
    ...row,
    herb_slug: toSlug(getFirst(row, ['herb_slug', 'herbSlug', 'herb', 'herb_name'])),
    compound_slug: toSlug(
      getFirst(row, ['compound_slug', 'compoundSlug', 'compound', 'compound_name']),
    ),
    concentration: getFirst(row, ['concentration', 'amount']),
    role: getFirst(row, ['role', 'compound_role']),
    evidence_link: getFirst(row, ['evidence_link', 'source_id', 'source']),
  }
}

function assertUniqueSlugs(records, type) {
  const seen = new Map()
  const duplicates = []

  records.forEach((record, index) => {
    if (!record.slug) return
    if (seen.has(record.slug)) {
      duplicates.push(`${type}:${record.slug} rows=${seen.get(record.slug) + 2},${index + 2}`)
    } else {
      seen.set(record.slug, index)
    }
  })

  if (duplicates.length) {
    throw new Error(`[data] Duplicate ${type} slugs found:\n${duplicates.join('\n')}`)
  }
}

function validateEntities(records, type) {
  const problems = []

  records.forEach((record, index) => {
    const rowNumber = index + 2

    if (!record.slug) problems.push(`${type} row ${rowNumber}: missing slug`)
    if (!record.name) problems.push(`${type} row ${rowNumber}: missing name`)

    if (record.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
      problems.push(`${type} row ${rowNumber}: invalid slug "${record.slug}"`)
    }

    if (
      record.evidence_grade &&
      !VALID_EVIDENCE_GRADES.has(normalizeEvidenceGrade(record.evidence_grade))
    ) {
      problems.push(
        `${type} row ${rowNumber}: invalid evidence_grade "${record.evidence_grade}"`,
      )
    }
  })

  if (problems.length) {
    throw new Error(`[data] Invalid ${type} rows:\n${problems.slice(0, 50).join('\n')}`)
  }

  assertUniqueSlugs(records, type)
}

function validateClaims(claims, validSlugs) {
  const bad = []

  claims.forEach((claim, index) => {
    if (!claim.target_slug || !validSlugs.has(claim.target_slug)) {
      bad.push({
        index,
        target_slug: claim.target_slug || '',
        herb_slug: claim.herb_slug || '',
        compound_slug: claim.compound_slug || '',
        entity_slug: claim.entity_slug || '',
        slug: claim.slug || '',
        claim: claim.claim || '',
        claim_text: claim.claim_text || '',
        pmid: claim.pmid || '',
      })
    }

    if (
      claim.evidence_grade &&
      !VALID_EVIDENCE_GRADES.has(normalizeEvidenceGrade(claim.evidence_grade))
    ) {
      bad.push({
        index,
        target_slug: claim.target_slug || '',
        problem: `invalid evidence_grade "${claim.evidence_grade}"`,
      })
    }
  })

  if (bad.length) {
    console.error('[data] Invalid Claim Rows preview:')
    for (const row of bad.slice(0, 25)) {
      console.error(JSON.stringify(row, null, 2))
    }
    throw new Error(`[data] Invalid Claim Rows: ${bad.length} rows failed validation.`)
  }
}

function cleanAndValidateMapRows(mapRows, herbSlugs, compoundSlugs) {
  const kept = []
  const removed = []
  const missingCompounds = []

  mapRows.forEach((row, index) => {
    if (!row.herb_slug || !herbSlugs.has(row.herb_slug)) {
      removed.push(`map row ${index + 2}: invalid herb_slug "${row.herb_slug}"`)
      return
    }

    if (!row.compound_slug) {
      removed.push(`map row ${index + 2}: missing compound_slug`)
      return
    }

    if (!compoundSlugs.has(row.compound_slug)) {
      missingCompounds.push(`map row ${index + 2}: compound not found "${row.compound_slug}"`)
      return
    }

    kept.push(row)
  })

  return { kept, removed, missingCompounds }
}

function writeJson(outputDir, filename, data) {
  const outFile = path.join(outputDir, filename)
  fs.writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  return outFile
}

function main() {
  const outputDir = parseArgs(process.argv)
  const workbookPath = resolveWorkbookPath(repoRoot)

  console.log(`[workbook-source] Resolved: ${workbookPath}`)

  const workbook = XLSX.readFile(workbookPath, { cellDates: false })

  const rawHerbs = readSheetRows(workbook, SHEETS.herbs)
  const rawCompounds = readSheetRows(workbook, SHEETS.compounds)
  const rawClaims = readSheetRows(workbook, SHEETS.claims)
  const rawMapRows = readSheetRows(workbook, SHEETS.herbCompoundMap)

  const herbs = rawHerbs.map(row => normalizeEntityRow(row, 'herb'))
  const compounds = rawCompounds.map(row => normalizeEntityRow(row, 'compound'))

  validateEntities(herbs, 'herb')
  validateEntities(compounds, 'compound')

  const herbSlugs = new Set(herbs.map(row => row.slug))
  const compoundSlugs = new Set(compounds.map(row => row.slug))
  const validClaimSlugs = new Set([...herbSlugs, ...compoundSlugs])

  let blankClaimRowsRemoved = 0

  const claims = rawClaims
    .filter(row => {
      if (isBlankClaimRow(row)) {
        blankClaimRowsRemoved += 1
        return false
      }
      return true
    })
    .map(normalizeClaimRow)

  validateClaims(claims, validClaimSlugs)

  const normalizedMapRows = rawMapRows
    .map(normalizeMapRow)
    .filter(row => row.herb_slug || row.compound_slug)

  const {
    kept: herbCompoundMap,
    removed: removedMapRows,
    missingCompounds: mapWarnings,
  } = cleanAndValidateMapRows(normalizedMapRows, herbSlugs, compoundSlugs)

  fs.mkdirSync(outputDir, { recursive: true })

  const herbsFile = writeJson(outputDir, 'herbs.json', herbs)
  const compoundsFile = writeJson(outputDir, 'compounds.json', compounds)
  const claimsFile = writeJson(outputDir, 'claims.json', claims)
  const mapFile = writeJson(outputDir, 'herb-compound-map.json', herbCompoundMap)

  const buildReport = {
    workbook: path.relative(repoRoot, workbookPath),
    generated_at: new Date().toISOString(),
    sheets: SHEETS,
    counts: {
      herbs: herbs.length,
      compounds: compounds.length,
      claims: claims.length,
      herbCompoundMap: herbCompoundMap.length,
      blankClaimRowsRemoved,
      orphanMapRowsRemoved: removedMapRows.length,
      mapCompoundWarnings: mapWarnings.length,
    },
    warnings: {
      orphanMapRowsRemoved: removedMapRows.slice(0, 100),
      mapCompoundWarnings: mapWarnings.slice(0, 100),
    },
    validation: {
      missingHerbSlugOrName: 0,
      missingCompoundSlugOrName: 0,
      duplicateHerbSlugs: 0,
      duplicateCompoundSlugs: 0,
      invalidClaimRows: 0,
      orphanMapRowsRemoved: removedMapRows.length,
    },
  }

  const reportFile = writeJson(outputDir, 'build-report.json', buildReport)

  console.log(`[data] Wrote ${herbs.length} herbs → ${path.relative(repoRoot, herbsFile)}`)
  console.log(
    `[data] Wrote ${compounds.length} compounds → ${path.relative(repoRoot, compoundsFile)}`,
  )
  console.log(`[data] Wrote ${claims.length} claims → ${path.relative(repoRoot, claimsFile)}`)
  console.log(
    `[data] Wrote ${herbCompoundMap.length} herb-compound map rows → ${path.relative(
      repoRoot,
      mapFile,
    )}`,
  )
  console.log(`[data] Wrote build report → ${path.relative(repoRoot, reportFile)}`)

  if (blankClaimRowsRemoved > 0) {
    console.log(`[data] Removed ${blankClaimRowsRemoved} blank Claim Rows`)
  }

  if (removedMapRows.length > 0) {
    console.warn(`[data] Removed ${removedMapRows.length} orphan Herb Compound Map rows`)
  }

  if (mapWarnings.length > 0) {
    console.warn(`[data] Warning: ${mapWarnings.length} map rows reference missing compounds`)
  }
}

main()
