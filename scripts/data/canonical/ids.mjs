// Deterministic, stable ID generation.
//
// IDs are derived by hashing a normalized seed so that re-running migration or
// re-importing an unchanged record always produces the same ID. This is what
// makes the whole pipeline idempotent.

import crypto from 'node:crypto'

function hash12(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 12)
}

// Normalize a value for use inside a hash seed: collapse whitespace, lowercase.
export function normalizeSeed(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Entity ID: ent_<type>_<hash12(type|seed)>.
// Seed should be the most stable available identifier — prefer slug, then
// canonical_name. The type is part of the seed so a herb and compound sharing a
// slug still get distinct IDs.
export function entityId(entityType, seed) {
  const type = normalizeSeed(entityType)
  const s = normalizeSeed(seed)
  return `ent_${type}_${hash12(`${type}|${s}`)}`
}

// Claim ID: clm_<hash12(subject|predicate|object|qualifierKey)>.
export function claimId({ subject_id, predicate, object_id, object_literal, qualifiers }) {
  const objectPart = object_id
    ? `id:${normalizeSeed(object_id)}`
    : `lit:${normalizeSeed(typeof object_literal === 'object' ? JSON.stringify(object_literal) : object_literal)}`
  const qualifierPart = qualifiers && Object.keys(qualifiers).length
    ? stableStringify(qualifiers)
    : ''
  return `clm_${hash12(`${normalizeSeed(subject_id)}|${normalizeSeed(predicate)}|${objectPart}|${qualifierPart}`)}`
}

// Edge ID: edg_<hash12(from|rel_type|to)>.
export function edgeId({ from_id, rel_type, to_id }) {
  return `edg_${hash12(`${normalizeSeed(from_id)}|${normalizeSeed(rel_type)}|${normalizeSeed(to_id)}`)}`
}

// Source ID: src_<hash12(strongest available identifier)>.
// PMID > DOI > URL > (title+year). This makes the same citation resolve to one
// source even when it appears in multiple rows.
export function sourceId({ pmid, doi, url, title, year }) {
  let seed
  if (pmid) seed = `pmid:${normalizeSeed(pmid)}`
  else if (doi) seed = `doi:${normalizeSeed(doi)}`
  else if (url) seed = `url:${normalizeSeed(url)}`
  else seed = `ref:${normalizeSeed(title)}|${normalizeSeed(year)}`
  return `src_${hash12(seed)}`
}

// Content hash of an arbitrary value (used for patch raw-content hashing and
// snapshot integrity). Full sha256 hex.
export function contentHash(input) {
  const text = typeof input === 'string' ? input : stableStringify(input)
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

// Deterministic JSON stringify with sorted keys — so hashing and diffing are
// order-independent.
export function stableStringify(value) {
  return JSON.stringify(sortValue(value))
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortValue(value[key])
        return acc
      }, {})
  }
  return value
}
