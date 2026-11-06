import { extractCitationsFromRecord } from './citations'
import { summarizeEvidenceStudies, normalizeEvidenceStudyClass } from './evidence-study'
import { formatDisplayLabel } from './display-utils'

// Presentation aliases only; canonical identity and stable routes do not change.
const COMMON_NAMES: Record<string, string> = {
  ashwagandha: 'Ashwagandha',
  'hypericum-perforatum': "St John's wort",
  'cichorium-intybus': 'Chicory',
  'coriandrum-sativum': 'Coriander',
  'cymbopogon-citratus': 'Lemongrass',
  'brassica-juncea': 'Indian mustard',
  'silybum-marianum': 'Milk thistle',
}

export function profileCommonName(record: Record<string, unknown>): string {
  return COMMON_NAMES[String(record.slug)] || formatDisplayLabel(
    record.commonName || record.common || record.displayName ||
    String(record.name || record.slug || 'Profile').replace(/\s*\([^)]*\)\s*$/, ''),
  )
}

export function botanicalName(value: unknown): string {
  const name = String(value || '').trim()
  return name ? name[0].toUpperCase() + name.slice(1).toLowerCase() : ''
}

/** One publication inventory for every count on the public profile. */
export function profileEvidence(record: Record<string, unknown>) {
  const citations = extractCitationsFromRecord(record)
  const metrics = summarizeEvidenceStudies(citations.map(citation => ({
    ...citation,
    id: citation.id || citation.pmid || citation.doi || citation.url || citation.title,
    evidenceClass: citation.evidenceClass || normalizeEvidenceStudyClass(citation.studyType),
    relationship: citation.relationship || 'background',
    confidence: citation.confidence || 'unknown',
  })))
  return { citations, metrics }
}

/** Missing independence cannot be repaired by adding publication sample sizes. */
export const PARTICIPANT_BOUNDARY = 'Sample sizes describe individual publications. A unique participant total is not established; reviews and reports may include the same trials or people.'
