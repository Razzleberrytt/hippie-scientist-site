#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { readWorkbook, getSheet, sheetToRows } from './workbook-parser.mjs'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const WORKBOOK_PATH = path.join(ROOT, 'data-sources', 'herb_monograph_master.xlsx')
const OUTPUT_FILE = path.join(DATA_DIR, 'freshness-metadata.json')

const REVIEW_DATE_FIELDS = [
  'editorial_reviewed_at',
  'editorialReviewedAt',
  'evidence_reviewed_at',
  'evidenceReviewedAt',
  'last_reviewed',
  'lastReviewed',
  'reviewed_at',
  'reviewedAt',
]
const EVIDENCE_SEARCH_FIELDS = [
  'last_evidence_search_date',
  'lastEvidenceSearchDate',
  'evidence_search_date',
  'evidenceSearchDate',
  'literature_search_date',
  'literatureSearchDate',
]
const FACTUAL_UPDATE_FIELDS = [
  'factual_updated_at',
  'factualUpdatedAt',
  'content_updated_at',
  'contentUpdatedAt',
  'data_updated_at',
  'dataUpdatedAt',
]
const TEMPLATE_UPDATE_FIELDS = [
  'template_updated_at',
  'templateUpdatedAt',
  'build_updated_at',
  'buildUpdatedAt',
]

function parsePmid(value) {
  if (!value) return undefined
  const match = String(value).match(/\b(\d{7,8})\b/)
  return match?.[1]
}

function validDate(value) {
  if (!value) return ''
  const clean = String(value).trim()
  if (!clean || Number.isNaN(Date.parse(clean))) return ''
  return clean
}

function firstDate(record, fields) {
  if (!record || typeof record !== 'object') return ''
  for (const field of fields) {
    const value = validDate(record[field])
    if (value) return value
  }
  return ''
}

/**
 * Review freshness is fail-closed. Generic last_updated/updatedAt fields are
 * intentionally excluded because deployments, migrations, and data transforms
 * can touch them without any editorial/scientific review taking place.
 */
function getFreshness(record, citationCount) {
  return {
    lastReviewed: firstDate(record, REVIEW_DATE_FIELDS),
    evidenceSearchDate: firstDate(record, EVIDENCE_SEARCH_FIELDS),
    factualUpdatedAt: firstDate(record, FACTUAL_UPDATE_FIELDS),
    templateUpdatedAt: firstDate(record, TEMPLATE_UPDATE_FIELDS),
    citationCount,
  }
}

function extractCitationsFromRecord(record) {
  const results = []

  const addCitation = (title, pmid, year, authors) => {
    if (!title && !pmid) return
    const cleanTitle = String(title || '').trim()
    const cleanPmid = parsePmid(pmid || cleanTitle)
    const duplicate = results.some(citation =>
      (cleanPmid && citation.pmid === cleanPmid) ||
      (!cleanPmid && cleanTitle && citation.title === cleanTitle),
    )
    if (!duplicate) results.push({ title: cleanTitle, pmid: cleanPmid, year, authors })
  }

  for (const source of Array.isArray(record?.sources) ? record.sources : []) {
    if (!source) continue
    if (typeof source === 'string') addCitation(source, source)
    else if (typeof source === 'object') {
      addCitation(source.title || source.citation || source.ref, source.pmid || source.pubmedId, source.year, source.authors)
    }
  }

  for (const reference of Array.isArray(record?.references) ? record.references : []) {
    if (!reference) continue
    if (typeof reference === 'string') addCitation(reference, reference)
    else if (typeof reference === 'object') {
      addCitation(reference.title || reference.citation || reference.ref, reference.pmid || reference.pubmedId, reference.year, reference.authors)
    }
  }

  for (const pmid of Array.isArray(record?.pmids) ? record.pmids : []) {
    if (pmid) addCitation(`PubMed ${String(pmid).trim()}`, pmid)
  }

  return results
}

async function loadStudyRegistryCitations() {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    console.warn('[freshness-metadata] Workbook not found at:', WORKBOOK_PATH)
    return {}
  }

  let workbook
  try {
    workbook = await readWorkbook(WORKBOOK_PATH)
  } catch (error) {
    console.warn('[freshness-metadata] Could not read workbook:', error.message)
    return {}
  }

  const sheetCandidates = ['Study Registry', 'Evidence_Register', 'Sheet8']
  const sheetName = sheetCandidates.find(name => getSheet(workbook, name))
  if (!sheetName) {
    console.warn('[freshness-metadata] No study registry sheet found')
    return {}
  }

  const results = {}
  for (const row of sheetToRows(getSheet(workbook, sheetName))) {
    const slug = String(row.compound_slug || row.slug || row.herb_slug || row.entity_slug || '').trim().toLowerCase()
    const source = String(row.pmid_or_source || row.pmid || row.doi || row.url_or_source || row.source || '').trim()
    const notes = String(row.notes || row.study_title || row.title || row.supported_claim_language || '').trim()
    const studyType = String(row.study_type || row.evidence_type || '').trim()
    if (!slug || !source) continue

    const pmid = parsePmid(source)
    const title = notes || (pmid ? `PubMed ${pmid}` : source)
    if (!results[slug]) results[slug] = []
    if (!results[slug].some(citation => (pmid && citation.pmid === pmid) || citation.title === title)) {
      results[slug].push({ title, pmid, studyType })
    }
  }

  return results
}

function parseGoalsConfig() {
  const goalsFilePath = path.join(ROOT, 'data', 'goals.ts')
  if (!fs.existsSync(goalsFilePath)) return []

  const content = fs.readFileSync(goalsFilePath, 'utf8')
  const goals = []
  const goalBlockRegex = /slug:\s*'([^']+)',[\s\S]*?options:\s*\[([\s\S]*?)\]/g
  let match

  while ((match = goalBlockRegex.exec(content)) !== null) {
    const optionSlugs = []
    const optionRegex = /slug:\s*'([^']+)'/g
    let optionMatch
    while ((optionMatch = optionRegex.exec(match[2])) !== null) optionSlugs.push(optionMatch[1])
    goals.push({ slug: match[1], options: optionSlugs })
  }

  return goals
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function combineCitations(...lists) {
  const combined = []
  for (const list of lists) {
    for (const citation of list || []) {
      const duplicate = combined.some(existing =>
        (citation.pmid && existing.pmid === citation.pmid) ||
        (!citation.pmid && citation.title && existing.title === citation.title),
      )
      if (!duplicate) combined.push(citation)
    }
  }
  return combined
}

async function main() {
  console.log('[freshness-metadata] Starting truthful freshness compilation...')

  const studyRegistry = await loadStudyRegistryCitations()
  const goalsConfig = parseGoalsConfig()
  const herbs = readJson(path.join(DATA_DIR, 'herbs.json'), [])
  const compounds = readJson(path.join(DATA_DIR, 'compounds.json'), [])

  const engines = {}
  for (const goal of ['sleep', 'stress', 'focus', 'anxiety']) {
    const enginePath = path.join(DATA_DIR, 'evidence-engine', `${goal}.json`)
    if (fs.existsSync(enginePath)) engines[goal] = readJson(enginePath, {})
  }

  function getEngineCitationsForSlug(slug) {
    const citations = []
    for (const engine of Object.values(engines)) {
      const sourcesByClaim = engine.sourcesByClaim || {}
      for (const claim of engine.claims || []) {
        if (claim.ingredient_slug !== slug && claim.ingredientSlug !== slug) continue
        const sources = sourcesByClaim[claim.claim_id] || sourcesByClaim[claim.claimId] || []
        for (const source of sources) {
          const title = source.title || source.citation || ''
          citations.push({
            title,
            pmid: source.pmid || parsePmid(source.url) || parsePmid(title),
            year: source.year,
            authors: source.authors || source.citation_label,
          })
        }
      }
    }
    return combineCitations(citations)
  }

  const metadata = {
    homepage: {
      // This is an explicitly maintained editorial date, not a deployment time.
      lastReviewed: '2026-06-06',
      evidenceSearchDate: '',
      factualUpdatedAt: '',
      templateUpdatedAt: '',
      citationCount: 0,
    },
    goals: {},
    profiles: {},
  }

  const allUniqueStudies = []
  const addUniqueStudies = citations => {
    for (const citation of citations) {
      const duplicate = allUniqueStudies.some(existing =>
        (citation.pmid && existing.pmid === citation.pmid) ||
        (!citation.pmid && citation.title && existing.title === citation.title),
      )
      if (!duplicate) allUniqueStudies.push(citation)
    }
  }

  for (const [kind, records] of [['herbs', herbs], ['compounds', compounds]]) {
    console.log(`[freshness-metadata] Processing ${kind}...`)
    for (const record of records) {
      const detailPath = path.join(DATA_DIR, `${kind}-detail`, `${record.slug}.json`)
      const detail = readJson(detailPath, {})
      const merged = { ...record, ...detail }
      const citations = combineCitations(
        extractCitationsFromRecord(merged),
        getEngineCitationsForSlug(record.slug),
        studyRegistry[record.slug] || [],
      )

      addUniqueStudies(citations)
      metadata.profiles[record.slug] = getFreshness(merged, citations.length)
    }
  }

  const goalRegistryDates = {
    sleep: '2026-05-10',
    stress: '2026-05-10',
    anxiety: '2026-05-10',
    focus: '2026-05-10',
    recovery: '2026-05-10',
    longevity: '2026-05-10',
    cognition: '2026-05-10',
    inflammation: '2026-05-10',
    pain: '2026-05-10',
  }

  for (const goal of goalsConfig) {
    const goalCitations = []
    for (const optionSlug of goal.options) {
      const herbDetail = path.join(DATA_DIR, 'herbs-detail', `${optionSlug}.json`)
      const compoundDetail = path.join(DATA_DIR, 'compounds-detail', `${optionSlug}.json`)
      const detail = fs.existsSync(herbDetail)
        ? readJson(herbDetail, {})
        : readJson(compoundDetail, {})
      goalCitations.push(
        ...extractCitationsFromRecord(detail),
        ...(studyRegistry[optionSlug] || []),
        ...getEngineCitationsForSlug(optionSlug),
      )
    }

    const engine = engines[goal.slug]
    if (engine) {
      for (const sources of Object.values(engine.sourcesByClaim || {})) {
        for (const source of sources) {
          const title = source.title || source.citation || ''
          goalCitations.push({
            title,
            pmid: source.pmid || parsePmid(source.url) || parsePmid(title),
            year: source.year,
            authors: source.authors,
          })
        }
      }
    }

    metadata.goals[goal.slug] = {
      lastReviewed: goalRegistryDates[goal.slug] || '',
      evidenceSearchDate: '',
      factualUpdatedAt: '',
      templateUpdatedAt: '',
      citationCount: combineCitations(goalCitations).length,
    }
  }

  metadata.homepage.citationCount = allUniqueStudies.length
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')

  const reviewedProfiles = Object.values(metadata.profiles).filter(profile => profile.lastReviewed).length
  console.log(`[freshness-metadata] Wrote ${OUTPUT_FILE}`)
  console.log(`[freshness-metadata] ${reviewedProfiles}/${Object.keys(metadata.profiles).length} profiles have an explicit editorial review date`)
  console.log(`[freshness-metadata] ${metadata.homepage.citationCount} unique cited sources in the compiled library`)
}

main().catch(error => {
  console.error('[freshness-metadata] Compilation failed:', error)
  process.exit(1)
})
