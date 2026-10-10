/**
 * Typed publication-identity interpretation layer.
 *
 * canonicalStudyIdentityMap (lib/research-coverage.ts) and the citation
 * resolver beneath it (lib/citation-identifiers.mjs) emit canonical
 * identifier STRINGS such as `pmid:38561618`, `doi:10.1000/xyz`, or
 * `source-ref:src_pubmed-999`. Those strings are the wire format of the
 * single bibliographic reconciler (union-find over DOI/PMID aliases).
 *
 * This module is the ONLY place permitted to interpret those strings into
 * typed fields. It performs NO reconciliation of its own: every typed value
 * here is derived from a canonical string the reconciler already produced.
 * Consumers must use parseStudyIdentity / pmidForIdentity instead of
 * string-splitting canonical identifiers inline (e.g. `.replace(/^pmid:/,'')`,
 * which silently corrupts DOI-canonical identifiers).
 *
 * Two concepts stay distinct (per the Round 1C review decision):
 * - Canonical bibliographic identifier: deterministic preferred identifier
 *   for the currently verified metadata. It CAN change when better aliases
 *   are discovered (union-find roots are sort-minimal, so a newly found DOI
 *   can move a root from `pmid:` to `doi:`).
 * - Persistent publication identity: stable internal key whose continuity
 *   survives alias discovery. NOT implemented here; R2A work.
 */
export type StudyIdentityType = 'pmid' | 'doi' | 'source-ref' | 'unknown'

export type StudyIdentity = {
  /** The reconciler's canonical identifier string, preserved verbatim. */
  canonical: string
  type: StudyIdentityType
  /** PMID embedded in a pmid:-canonical identifier, else null. */
  pmid: string | null
  /** DOI embedded in a doi:-canonical identifier (lowercased, no prefix), else null. */
  doi: string | null
}

/**
 * Interpret one canonical identifier string into typed fields.
 * Malformed or unrecognized strings yield type 'unknown' with null fields;
 * they are never coerced into a fabricated PMID or DOI.
 */
export function parseStudyIdentity(canonical: unknown): StudyIdentity {
  const c = typeof canonical === 'string' ? canonical.trim() : String(canonical ?? '').trim()
  const pmidMatch = /^pmid:(\d+)$/i.exec(c)
  if (pmidMatch) {
    return { canonical: c, type: 'pmid', pmid: pmidMatch[1], doi: null }
  }
  const doiMatch = /^doi:(.+)$/i.exec(c)
  if (doiMatch && doiMatch[1].trim()) {
    return { canonical: c, type: 'doi', pmid: null, doi: doiMatch[1].trim() }
  }
  if (/^source-ref:/i.test(c)) {
    return { canonical: c, type: 'source-ref', pmid: null, doi: null }
  }
  return { canonical: c, type: 'unknown', pmid: null, doi: null }
}

/**
 * Build canonical-root -> verified PMID associations from source metadata.
 *
 * A doi:-canonical root is associated with a PMID only when the verified
 * source records that resolved to it carry exactly one distinct PMID.
 * Ambiguous associations (two PMIDs, same DOI root) and absent ones are
 * dropped. Nothing is fabricated: callers must treat a missing entry as
 * "unknown", never as evidence of independence.
 */
export function buildPmidByCanonicalRoot(
  entries: Array<{ canonical: string; pmid?: unknown }>,
): Map<string, string> {
  const byRoot = new Map<string, Set<string>>()
  for (const { canonical, pmid } of entries) {
    const parsed = parseStudyIdentity(canonical)
    if (parsed.type !== 'doi') continue
    const p = typeof pmid === 'string' ? pmid.trim() : ''
    if (!/^\d+$/.test(p)) continue
    const set = byRoot.get(parsed.canonical) ?? new Set<string>()
    set.add(p)
    byRoot.set(parsed.canonical, set)
  }
  const out = new Map<string, string>()
  for (const [root, pmids] of byRoot) {
    if (pmids.size === 1) out.set(root, [...pmids][0])
  }
  return out
}

/**
 * Resolve the PMID field for a parsed identity.
 * - pmid-typed: the embedded PMID.
 * - doi-typed: the verified associated PMID from source metadata, else null.
 * - source-ref / unknown: null. A DOI-canonical identifier must NEVER appear
 *   inside a PMID field.
 */
export function pmidForIdentity(
  identity: StudyIdentity,
  pmidByCanonicalRoot: Map<string, string>,
): string | null {
  if (identity.type === 'pmid') return identity.pmid
  if (identity.type === 'doi') return pmidByCanonicalRoot.get(identity.canonical) ?? null
  return null
}

/**
 * PMIDs eligible for metadata joins, derived from typed identities.
 * Replaces the old pattern of stripping a `pmid:` prefix and hoping the
 * remainder is numeric. DOI-canonical identities contribute their verified
 * associated PMID (when known); unresolvable identities contribute nothing.
 */
export function identityPmidsForJoin(
  canonicalIdentities: readonly string[],
  pmidByCanonicalRoot: Map<string, string>,
): string[] {
  const pmids = new Set<string>()
  for (const canonical of canonicalIdentities) {
    const pmid = pmidForIdentity(parseStudyIdentity(canonical), pmidByCanonicalRoot)
    if (pmid) pmids.add(pmid)
  }
  return [...pmids].sort()
}
