/**
 * Round 1C: DOI/PMID alias reconciliation.
 *
 * Production claims carry PMIDs but no DOIs. The PubMed cache holds DOIs for
 * 92% of records. This module enriches synthetic source records with DOIs
 * from the cache, enabling the existing canonicalStudyIdentityMap to
 * reconcile DOI+PMID aliases using its built-in citation-identifier logic.
 *
 * No new identity machinery: we feed the existing reconciler better inputs.
 */
import { loadPubmedCache, type PubmedCache } from '@/lib/research-coverage'

export type DoiEnrichment = {
  pmid: string
  doi: string | null
  source: 'pubmed-cache' | 'absent'
}

/**
 * Look up DOIs for PMIDs from the PubMed cache.
 * Returns a map of PMID -> DOI (or null when unavailable).
 */
export function enrichDoisFromCache(
  pmids: string[],
  cache: PubmedCache,
): Map<string, DoiEnrichment> {
  const result = new Map<string, DoiEnrichment>()
  for (const pmid of pmids) {
    const record = cache[pmid] as Record<string, unknown> | undefined
    const doi = typeof record?.doi === 'string' ? record.doi.trim() : ''
    result.set(pmid, {
      pmid,
      doi: doi || null,
      source: doi ? 'pubmed-cache' : 'absent',
    })
  }
  return result
}

/**
 * Enrich 1A-style source records with DOI fields for alias reconciliation.
 * Input: [{id, pmid, url}]; output: same records plus doi where available.
 * Records without a DOI pass through unchanged (PMID-only identity still works).
 */
export function enrichSourceRecordsWithDoi<T extends { pmid?: unknown }>(
  sources: T[],
  doiMap: Map<string, DoiEnrichment>,
): Array<T & { doi?: string }> {
  return sources.map((s) => {
    const pmid = String(s.pmid ?? '').trim()
    const enrichment = doiMap.get(pmid)
    if (enrichment?.doi) {
      return { ...s, doi: enrichment.doi }
    }
    return { ...s }
  })
}

export function loadCacheForEnrichment(root = process.cwd()): PubmedCache {
  return loadPubmedCache(root)
}
