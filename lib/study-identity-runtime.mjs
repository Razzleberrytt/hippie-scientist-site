/**
 * Shared runtime implementation of the canonical study-identity interpreter.
 * Its public TypeScript entry point is lib/study-identity.ts. Node research
 * adapters import this same implementation instead of maintaining separate
 * DOI/PMID grammars. Identity parsing is NOT evidence-strength verification.
 *
 * @typedef {'pmid'|'doi'|'source-ref'|'unknown'} StudyIdentityType
 * @typedef {{canonical:string,type:StudyIdentityType,pmid:string|null,doi:string|null}} StudyIdentity
 */

/** @param {unknown} canonical
 *  @returns {StudyIdentity}
 */
export function parseStudyIdentity(canonical) {
  const c = typeof canonical === 'string' ? canonical.trim() : String(canonical ?? '').trim()
  const pmidMatch = /^pmid:(\d+)$/i.exec(c)
  if (pmidMatch) {
    return { canonical: c, type: 'pmid', pmid: pmidMatch[1], doi: null }
  }
  const doiMatch = /^doi:(.+)$/i.exec(c)
  if (doiMatch) {
    const rawDoi = doiMatch[1].trim()
    // Match the existing typed bibliographic identity contract (ISO 26324).
    if (/^10\.\d+\/\S+$/i.test(rawDoi)) {
      return { canonical: c, type: 'doi', pmid: null, doi: rawDoi.toLowerCase() }
    }
  }
  if (/^source-ref:/i.test(c)) {
    return { canonical: c, type: 'source-ref', pmid: null, doi: null }
  }
  return { canonical: c, type: 'unknown', pmid: null, doi: null }
}
