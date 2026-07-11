import fs from 'node:fs'
import path from 'node:path'
import { loadDataset } from './store.mjs'

const EXCLUDED_REVIEW_STATUSES = new Set(['rejected', 'deprecated'])
const PROFILE_TYPES = new Set(['herb', 'compound'])

function text(value) {
  return String(value ?? '').trim()
}

function compact(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value == null) return false
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return true
    }),
  )
}

function normalizeDoi(value) {
  return text(value)
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
}

function sourceUrl(source) {
  const direct = text(source?.url)
  if (direct) return direct
  const doi = normalizeDoi(source?.doi)
  if (doi) return `https://doi.org/${doi}`
  const pmid = text(source?.pmid)
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
  return ''
}

function inferStudyType(source) {
  const haystack = [
    source?.title,
    source?.citation,
    source?.used_for,
    source?.legacy?.record_type,
    source?.legacy?.study_type,
  ].map(text).join(' ').toLowerCase()

  if (/meta[- ]analysis/.test(haystack)) return 'Meta-analysis'
  if (/systematic review/.test(haystack)) return 'Systematic review'
  if (/randomi[sz]ed|\brct\b|placebo[- ]controlled|crossover/.test(haystack)) return 'Randomized controlled trial'
  if (/observational|cohort|cross[- ]sectional/.test(haystack)) return 'Observational'
  if (/animal|rodent|mouse|mice|rat\b|in vivo/.test(haystack)) return 'Animal'
  if (/in vitro|cell culture|mechanistic/.test(haystack)) return 'Mechanistic'
  return ''
}

function normalizeSource(source) {
  if (!source || typeof source !== 'object') return null

  const id = text(source.id)
  if (!id) return null

  const doi = normalizeDoi(source.doi)
  const pmid = text(source.pmid)
  const url = sourceUrl(source)
  const citation = text(source.citation)
  const title = text(source.title) || citation || (doi ? `DOI ${doi}` : pmid ? `PubMed ${pmid}` : url)
  if (!title && !url) return null

  return compact({
    id,
    title,
    url,
    doi,
    pmid,
    year: source.year,
    authors: text(source.author_or_label),
    journal: text(source.journal),
    citation,
    note: text(source.used_for),
    studyType: inferStudyType(source),
    reviewStatus: text(source.review_status) || 'pending',
  })
}

function claimText(claim, entityById) {
  const literal = text(claim?.object_literal)
  if (literal && literal.toLowerCase() !== 'unspecified') return literal

  const notes = text(claim?.notes)
  if (notes) return notes

  const object = entityById.get(text(claim?.object_id))
  if (object?.canonical_name) return text(object.canonical_name)

  return ''
}

function claimKey(claim) {
  const sourceIds = Array.isArray(claim?.sourceRefIds) ? claim.sourceRefIds.join('|') : ''
  return text(claim?.id) || `${text(claim?.predicate)}|${text(claim?.claim)}|${sourceIds}`
}

function sourceKey(source) {
  if (typeof source === 'string') return `string:${source.trim().toLowerCase()}`
  if (!source || typeof source !== 'object') return ''
  const doi = normalizeDoi(source.doi)
  const pmid = text(source.pmid || source.pubmedId)
  const url = text(source.url || source.href)
  const id = text(source.id || source.sourceId)
  const title = text(source.title)
  return id || (doi ? `doi:${doi.toLowerCase()}` : '') || (pmid ? `pmid:${pmid}` : '') || (url ? `url:${url.toLowerCase()}` : '') || (title ? `title:${title.toLowerCase()}` : '')
}

function uniqueBy(values, keyFn) {
  const seen = new Set()
  const output = []
  for (const value of values) {
    const key = keyFn(value)
    if (!key || seen.has(key)) continue
    seen.add(key)
    output.push(value)
  }
  return output
}

function mergeSources(existingSources, canonicalSources) {
  const byKey = new Map()

  for (const source of existingSources) {
    const key = sourceKey(source)
    if (key) byKey.set(key, source)
  }

  for (const source of canonicalSources) {
    const key = sourceKey(source)
    if (!key) continue
    const existing = byKey.get(key)
    if (existing && typeof existing === 'object' && typeof source === 'object') {
      byKey.set(key, compact({ ...existing, ...source }))
    } else {
      byKey.set(key, source)
    }
  }

  return [...byKey.values()]
}

function mergeClaims(existingClaims, canonicalClaims) {
  const byKey = new Map()

  for (const claim of existingClaims) {
    const key = claimKey(claim)
    if (key) byKey.set(key, claim)
  }

  for (const claim of canonicalClaims) {
    const key = claimKey(claim)
    if (!key) continue
    const existing = byKey.get(key)
    if (existing && typeof existing === 'object' && typeof claim === 'object') {
      byKey.set(key, compact({ ...existing, ...claim }))
    } else {
      byKey.set(key, claim)
    }
  }

  return [...byKey.values()]
}

export function buildCanonicalCitationOverlay(dataset) {
  const entities = Array.isArray(dataset?.entities) ? dataset.entities : []
  const claims = Array.isArray(dataset?.claims) ? dataset.claims : []
  const sources = Array.isArray(dataset?.sources) ? dataset.sources : []

  const entityById = new Map(entities.map((entity) => [entity.id, entity]))
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const grouped = new Map()

  for (const claim of [...claims].sort((a, b) => text(a?.id).localeCompare(text(b?.id)))) {
    if (EXCLUDED_REVIEW_STATUSES.has(text(claim?.review_status).toLowerCase())) continue

    const subject = entityById.get(text(claim?.subject_id))
    if (!subject || !PROFILE_TYPES.has(subject.entity_type) || !text(subject.slug)) continue

    const sourceIds = uniqueBy(
      (Array.isArray(claim?.source_ids) ? claim.source_ids : [])
        .map(text)
        .filter((id) => sourceById.has(id)),
      (id) => id,
    ).sort()
    if (!sourceIds.length) continue

    const value = claimText(claim, entityById)
    if (!value) continue

    const slug = text(subject.slug)
    if (!grouped.has(slug)) {
      grouped.set(slug, {
        entityType: subject.entity_type,
        claims: [],
        sources: new Map(),
      })
    }

    const group = grouped.get(slug)
    for (const sourceId of sourceIds) {
      const normalized = normalizeSource(sourceById.get(sourceId))
      if (normalized) group.sources.set(sourceId, normalized)
    }

    group.claims.push(compact({
      id: text(claim.id),
      claim: value,
      predicate: text(claim.predicate),
      evidenceLevel: text(claim.evidence_level) || 'none',
      confidence: typeof claim.confidence === 'number' ? claim.confidence : undefined,
      reviewStatus: text(claim.review_status) || 'pending',
      notes: text(claim.notes),
      qualifiers: claim.qualifiers && typeof claim.qualifiers === 'object' ? claim.qualifiers : undefined,
      sourceRefIds: sourceIds,
    }))
  }

  const overlays = new Map()
  for (const [slug, group] of grouped.entries()) {
    const claimMap = uniqueBy(group.claims, claimKey)
      .sort((a, b) => text(a.id).localeCompare(text(b.id)))
    const normalizedSources = [...group.sources.values()]
      .sort((a, b) => text(a.id).localeCompare(text(b.id)))
    const sourceIds = normalizedSources.map((source) => source.id)
    const claimIds = claimMap.map((claim) => claim.id).filter(Boolean)
    const hasPendingReview = claimMap.some((claim) => text(claim.reviewStatus).toLowerCase() !== 'approved')
      || normalizedSources.some((source) => text(source.reviewStatus).toLowerCase() !== 'approved')

    overlays.set(slug, {
      entityType: group.entityType,
      claimMap,
      sources: normalizedSources,
      evidence: {
        reviewStatus: hasPendingReview ? 'sourced_pending_review' : 'sourced',
        sourceCount: sourceIds.length,
        sourceIds,
        claimCount: claimMap.length,
        claimIds,
      },
    })
  }

  return overlays
}

export function mergeCanonicalCitationOverlay(record, overlay) {
  if (!record || typeof record !== 'object' || !overlay) return record

  const existingSources = Array.isArray(record.sources) ? record.sources : []
  const existingClaims = Array.isArray(record.claimMap) ? record.claimMap : []
  const sources = mergeSources(existingSources, overlay.sources || [])
  const claimMap = mergeClaims(existingClaims, overlay.claimMap || [])
  const existingEvidence = record.evidence && typeof record.evidence === 'object' ? record.evidence : {}
  const sourceIds = uniqueBy([
    ...(Array.isArray(existingEvidence.sourceIds) ? existingEvidence.sourceIds : []),
    ...(overlay.evidence?.sourceIds || []),
  ].map(text).filter(Boolean), (id) => id).sort()
  const claimIds = uniqueBy([
    ...(Array.isArray(existingEvidence.claimIds) ? existingEvidence.claimIds : []),
    ...(overlay.evidence?.claimIds || []),
  ].map(text).filter(Boolean), (id) => id).sort()

  return {
    ...record,
    sources,
    claimMap,
    evidence: {
      ...existingEvidence,
      reviewStatus: overlay.evidence?.reviewStatus || existingEvidence.reviewStatus || 'needs_review',
      sourceCount: sourceIds.length,
      sourceIds,
      claimCount: claimMap.length,
      claimIds,
    },
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function exportCanonicalCitationsToRuntime({ dataDir = 'public/data', dataset = loadDataset() } = {}) {
  const resolvedDataDir = path.resolve(process.cwd(), dataDir)
  const overlays = buildCanonicalCitationOverlay(dataset)
  const report = {
    dataDir: path.relative(process.cwd(), resolvedDataDir),
    profilesWithCanonicalClaims: overlays.size,
    updated: [],
    skippedMissingDetail: [],
  }

  for (const [slug, overlay] of overlays.entries()) {
    const detailDir = overlay.entityType === 'herb' ? 'herbs-detail' : 'compounds-detail'
    const detailPath = path.join(resolvedDataDir, detailDir, `${slug}.json`)
    const record = readJson(detailPath)
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      report.skippedMissingDetail.push(slug)
      continue
    }

    const merged = mergeCanonicalCitationOverlay(record, overlay)
    if (JSON.stringify(merged) === JSON.stringify(record)) continue
    writeJson(detailPath, merged)
    report.updated.push({
      slug,
      entityType: overlay.entityType,
      claimCount: overlay.claimMap.length,
      sourceCount: overlay.sources.length,
    })
  }

  report.updated.sort((a, b) => a.slug.localeCompare(b.slug))
  report.skippedMissingDetail.sort()
  return report
}
