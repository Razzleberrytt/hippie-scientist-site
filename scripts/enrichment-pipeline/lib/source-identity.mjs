import {
  firstAuthorSurname,
  normalizeDoi,
  normalizePmcid,
  normalizePmid,
  normalizeTitleKey,
  normalizeUrl,
  normalizeYear,
} from './normalize.mjs'

/**
 * Stable source identity.
 *
 * Two records describe the same source when they agree on the strongest
 * identifier either of them carries. Precedence is deliberate:
 *
 *   1. DOI          — globally unique, publisher-assigned
 *   2. PMID / PMCID — unique within PubMed
 *   3. canonical URL — after tracking parameters are stripped
 *   4. title + year + first-author surname — last resort, and only when all
 *      three are present, because title-only matching is how unrelated papers
 *      get merged.
 *
 * `identityKey` is what deduplication and the research index compare. It never
 * falls back to a bare title: a record with nothing but a title is unidentified
 * and is kept separate rather than guessed at.
 */

export const IDENTITY_KINDS = ['doi', 'pmid', 'pmcid', 'url', 'title-year-author', 'none']

export function sourceIdentity(source) {
  const doi = normalizeDoi(source?.doi)
  if (doi) return { kind: 'doi', key: `doi:${doi}`, value: doi }

  const pmid = normalizePmid(source?.pmid)
  if (pmid) return { kind: 'pmid', key: `pmid:${pmid}`, value: pmid }

  const pmcid = normalizePmcid(source?.pmcid)
  if (pmcid) return { kind: 'pmcid', key: `pmcid:${pmcid}`, value: pmcid }

  // A PubMed URL carries a PMID; recover it rather than treating it as a URL.
  const url = normalizeUrl(source?.url)
  if (url) {
    const embedded = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{4,9})/i)
    if (embedded) return { kind: 'pmid', key: `pmid:${embedded[1]}`, value: embedded[1] }
    const embeddedPmc = url.match(/pmc\/articles\/(PMC\d+)/i)
    if (embeddedPmc) {
      const id = normalizePmcid(embeddedPmc[1])
      return { kind: 'pmcid', key: `pmcid:${id}`, value: id }
    }
    const embeddedDoi = url.match(/doi\.org\/(10\.\d{4,9}\/\S+)/i)
    if (embeddedDoi) {
      const id = normalizeDoi(embeddedDoi[1])
      if (id) return { kind: 'doi', key: `doi:${id}`, value: id }
    }
    return { kind: 'url', key: `url:${url}`, value: url }
  }

  const title = normalizeTitleKey(source?.title)
  const year = normalizeYear(source?.year)
  const author = firstAuthorSurname(source?.authors || source?.author_or_label)
  if (title && year && author) {
    const value = `${author}|${year}|${title}`
    return { kind: 'title-year-author', key: `tya:${value}`, value }
  }

  return { kind: 'none', key: '', value: '' }
}

export function isIdentified(source) {
  return sourceIdentity(source).kind !== 'none'
}

/**
 * Merge records that share an identity. Later records fill gaps in earlier ones
 * but never overwrite a value that is already present, so the first sighting of
 * a source stays authoritative and merging is order-stable for equal inputs.
 */
export function dedupeSources(sources) {
  const byKey = new Map()
  const unidentified = []
  const merges = []

  for (const source of sources) {
    const identity = sourceIdentity(source)
    if (identity.kind === 'none') {
      unidentified.push(source)
      continue
    }
    const existing = byKey.get(identity.key)
    if (!existing) {
      byKey.set(identity.key, { ...source, _identity: identity })
      continue
    }
    merges.push({ key: identity.key, kept: existing.id, dropped: source.id })
    for (const [field, value] of Object.entries(source)) {
      if (value === null || value === undefined || value === '') continue
      const current = existing[field]
      if (current === null || current === undefined || current === '') existing[field] = value
    }
  }

  return {
    sources: [...byKey.values()].map(({ _identity, ...rest }) => rest),
    identities: [...byKey.values()].map((s) => s._identity),
    unidentified,
    duplicatesRemoved: merges.length,
    merges,
  }
}

/** Cross-reference a candidate's sources against an index of known sources. */
export function classifySources(sources, knownIndex) {
  const reused = []
  const fresh = []
  for (const source of sources) {
    const identity = sourceIdentity(source)
    if (identity.kind !== 'none' && knownIndex?.has?.(identity.key)) {
      reused.push({ source, identity, existing: knownIndex.get(identity.key) })
    } else {
      fresh.push({ source, identity })
    }
  }
  return { reused, fresh }
}
