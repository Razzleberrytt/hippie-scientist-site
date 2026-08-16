import type { PubmedCache } from './research-coverage'

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

const SOURCE_EVIDENCE_FIELDS = [
  'title',
  'note',
  'citation',
  'abstract',
  'result',
  'results',
  'effect',
  'primaryOutcome',
  'secondaryOutcome',
  'outcomeRegistration',
] as const

/**
 * Canonical semantic evidence text for claim-level research analyzers.
 * Source-local metadata and cached PubMed metadata are intentionally combined
 * in one place so breadth, directionality, certainty, and reporting-bias
 * analyses cannot drift on which evidence fields they inspect.
 */
export function researchSourceEvidenceText(
  source: Record<string, unknown>,
  cache: PubmedCache,
): string {
  const pmid = text(source.pmid ?? source.pubmedId)
  const cached = pmid ? cache[pmid] ?? {} : {}
  return [
    ...SOURCE_EVIDENCE_FIELDS.map((field) => source[field]),
    ...SOURCE_EVIDENCE_FIELDS.map((field) => cached[field]),
  ].map(text).filter(Boolean).join(' · ')
}
