import type { Citation } from '@/components/ui/ShowMeTheStudies'
import { normalizePmidList } from '@/lib/citation-identifiers.mjs'
import {
  evidenceStudyId,
  normalizeEvidenceConfidence,
  normalizeEvidenceRelationship,
  normalizeEvidenceStudyClass,
} from '@/lib/evidence-study'

function parsePmid(value: string): string | undefined {
  const match = value.match(/\b(\d{7,8})\b/)
  return match?.[1]
}

function parseDoi(value: string): string | undefined {
  const match = value.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i)
  return match?.[1]?.replace(/[.,;)]$/, '')
}

function doiUrl(doi: string | undefined): string | undefined {
  return doi ? `https://doi.org/${doi}` : undefined
}

function firstString(src: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = src[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function stringArray(src: Record<string, unknown>, keys: string[]): string[] | undefined {
  for (const key of keys) {
    const value = src[key]
    if (Array.isArray(value)) {
      const normalized = value.map(item => String(item).trim()).filter(Boolean)
      if (normalized.length) return normalized
    }
    if (typeof value === 'string' && value.trim()) {
      const normalized = value.split(/[;,|]/).map(item => item.trim()).filter(Boolean)
      if (normalized.length) return normalized
    }
  }
  return undefined
}

function sourceObjectToCitation(src: Record<string, unknown>): Citation {
  const title =
    (src.title as string) ||
    (src.citation as string) ||
    (src.ref as string) ||
    ''
  const rawUrl = String(src.url || src.href || '').trim()
  const citationText = String(src.citation || '').trim()
  const doi = src.doi
    ? parseDoi(String(src.doi)) || String(src.doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    : parseDoi(rawUrl) || parseDoi(citationText)
  const pmid =
    src.pmid
      ? String(src.pmid)
      : src.pubmedId
        ? String(src.pubmedId)
        : parsePmid(rawUrl) || parsePmid(citationText)
  const url = rawUrl || doiUrl(doi) || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined)
  const studyType = firstString(src, ['studyType', 'study_type', 'design', 'design_type', 'publication_type', 'type'])
  const relationshipRaw = firstString(src, ['relationship', 'evidence_direction', 'direction', 'direction_of_effect'])
  const confidenceRaw = firstString(src, ['confidence', 'evidence_confidence', 'certainty'])

  const citation: Citation = {
    id: evidenceStudyId({ pmid, doi, url, title }),
    title,
    pmid,
    doi,
    url,
    year: src.year as number | string | undefined,
    authors: (src.authors || src.author_or_label) as string | undefined,
    journal: firstString(src, ['journal', 'source', 'publication', 'venue']),
    studyType,
    evidenceClass: normalizeEvidenceStudyClass(src.evidenceClass || src.evidence_class || studyType),
    sampleSize: (src.sampleSize || src.sample_size || src.n || src.participants) as string | number | undefined,
    dose: firstString(src, ['dose', 'dose_range', 'studied_dose', 'intervention_dose']),
    duration: firstString(src, ['duration', 'study_duration', 'timeframe']),
    population: firstString(src, ['population', 'participants_description', 'population_context']),
    outcome: firstString(src, ['outcome', 'primary_outcome', 'endpoint']),
    result: firstString(src, ['result', 'finding', 'result_summary', 'effect']),
    limitation: firstString(src, ['limitation', 'limitations', 'study_limitation', 'extraction_note']),
    relationship: normalizeEvidenceRelationship(relationshipRaw),
    confidence: normalizeEvidenceConfidence(confidenceRaw),
    statisticalConsistency: firstString(src, ['statistical_consistency', 'statisticalSignal', 'statistical_signal']),
    extractName: firstString(src, ['extract', 'extract_name', 'branded_extract', 'preparation']),
    ingredients: stringArray(src, ['ingredients', 'ingredient_slugs', 'entities']),
    conditions: stringArray(src, ['conditions', 'outcomes', 'condition_slugs']),
    safetyOutcome: firstString(src, ['safety_outcome', 'adverse_events', 'safety_result']),
  }

  return citation
}

/**
 * Expand a structured row that packs multiple PubMed studies into one field.
 * Metadata is copied to each publication, but a DOI is deliberately not assigned
 * when several PMIDs are present because the row does not establish which PMID
 * that DOI aliases.
 */
function sourceObjectToCitations(src: Record<string, unknown>): Citation[] {
  const pmids = normalizePmidList(src.pmid ?? src.pubmedId)
  if (pmids.length <= 1) return [sourceObjectToCitation(src)]

  return pmids.map((pmid) => sourceObjectToCitation({
    ...src,
    pmid,
    pubmedId: undefined,
    doi: undefined,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  }))
}

function stringToCitation(src: string): Citation {
  const pmid = parsePmid(src)
  const doi = parseDoi(src)
  const directUrl = /^https?:\/\//i.test(src.trim()) ? src.trim() : undefined
  const url = directUrl || doiUrl(doi) || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined)
  return {
    id: evidenceStudyId({ pmid, doi, url, title: src }),
    title: src,
    pmid,
    doi,
    url,
    evidenceClass: 'other',
    relationship: 'background',
    confidence: 'unknown',
  }
}

function stringToCitations(src: string): Citation[] {
  const pmids = normalizePmidList(src)
  if (pmids.length <= 1) return [stringToCitation(src)]
  return pmids.map((pmid) => ({
    id: `pmid:${pmid}`,
    title: src,
    pmid,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    evidenceClass: 'other',
    relationship: 'background',
    confidence: 'unknown',
  }))
}

function citationKey(citation: Citation): string {
  return citation.id || (citation.pmid
    ? `pmid:${citation.pmid}`
    : citation.doi
      ? `doi:${citation.doi.toLowerCase()}`
      : citation.url
        ? `url:${citation.url.toLowerCase()}`
        : `title:${citation.title.trim().toLowerCase()}`)
}

export function extractCitationsFromRecord(record: Record<string, unknown>): Citation[] {
  const results: Citation[] = []
  const seen = new Set<string>()

  const pushCitation = (citation: Citation) => {
    if (!citation.title && !citation.pmid && !citation.doi && !citation.url) return
    const key = citationKey(citation)
    if (seen.has(key)) return
    seen.add(key)
    results.push(citation)
  }

  const sources = record?.sources
  if (Array.isArray(sources)) {
    for (const src of sources) {
      if (!src) continue
      if (typeof src === 'string') {
        for (const citation of stringToCitations(src)) pushCitation(citation)
      } else if (typeof src === 'object') {
        for (const citation of sourceObjectToCitations(src as Record<string, unknown>)) pushCitation(citation)
      }
    }
  }

  const pmids = record?.pmids
  if (Array.isArray(pmids)) {
    for (const value of pmids) {
      if (!value) continue
      for (const id of normalizePmidList(value)) {
        pushCitation({
          id: `pmid:${id}`,
          title: `PubMed ${id}`,
          pmid: id,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          evidenceClass: 'other',
          relationship: 'background',
          confidence: 'unknown',
        })
      }
    }
  }

  const references = record?.references
  if (Array.isArray(references)) {
    for (const ref of references) {
      if (!ref) continue
      if (typeof ref === 'string') {
        for (const citation of stringToCitations(ref)) pushCitation(citation)
      } else if (typeof ref === 'object') {
        for (const citation of sourceObjectToCitations(ref as Record<string, unknown>)) pushCitation(citation)
      }
    }
  }

  return results
}
