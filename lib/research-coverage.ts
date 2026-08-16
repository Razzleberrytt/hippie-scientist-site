import fs from 'node:fs'
import path from 'node:path'

import { citationIdentifiers } from './citation-identifiers.mjs'
import { normalizeStudyClass, strongestStudyClass, type StudyClass } from './study-class'

export type ResearchSource = Record<string, unknown> & {
  id?: string
  pmid?: string
  pubmedId?: string
  doi?: string
  studyClass?: string
  studyType?: string
}

export type ResearchClaim = Record<string, unknown> & {
  id?: string
  predicate?: string
  confidence?: number
  reviewStatus?: string
  sourceRefIds?: string[]
}

export type ResearchProfile = Record<string, unknown> & {
  slug?: string
  sources?: ResearchSource[]
  claimMap?: ResearchClaim[]
}

export type ResearchProfileEntry = {
  kind: 'herbs' | 'compounds'
  url: string
  file: string
  record: ResearchProfile
}

export type PubmedCache = Record<string, Record<string, unknown>>

export const PRIMARY_HUMAN_STUDY_CLASSES = new Set<StudyClass>(['rct', 'controlled-trial', 'uncontrolled-trial'])
export const SYNTHESIS_STUDY_CLASSES = new Set<StudyClass>(['meta-analysis', 'systematic-review'])
export const NARRATIVE_STUDY_CLASSES = new Set<StudyClass>(['narrative-review'])

export function loadPubmedCache(root = process.cwd()): PubmedCache {
  const cachePath = path.join(root, 'ops', 'cache', 'pubmed-metadata.json')
  if (!fs.existsSync(cachePath)) return {}
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8')).records ?? {}
  } catch {
    return {}
  }
}

export function designFromPublicationTypes(publicationTypes: string[] = []): StudyClass {
  const classes = publicationTypes
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

export function sourceStudyClass(source: ResearchSource, cache: PubmedCache): StudyClass {
  const explicit = normalizeStudyClass(source.studyClass ?? source.studyType ?? '')
  if (explicit !== 'unclassified') return explicit
  const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
  const meta = (cache[pmid] ?? {}) as { publicationTypes?: string[] }
  return designFromPublicationTypes(meta.publicationTypes ?? [])
}

export function listResearchProfiles(root = process.cwd()): ResearchProfileEntry[] {
  const dataDir = path.join(root, 'public', 'data')
  const profiles: ResearchProfileEntry[] = []

  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ] as const) {
    const full = path.join(dataDir, dir)
    if (!fs.existsSync(full)) continue

    for (const name of fs.readdirSync(full)) {
      if (!name.endsWith('.json')) continue
      const file = path.join(full, name)
      try {
        const record = JSON.parse(fs.readFileSync(file, 'utf8')) as ResearchProfile
        const slug = String(record.slug ?? name.replace(/\.json$/, ''))
        profiles.push({ kind, url: `/${kind}/${slug}/`, file, record })
      } catch {
        // Malformed JSON belongs to the data-format validators, not topology.
      }
    }
  }

  return profiles
}

export function approvedClaims(record: ResearchProfile): ResearchClaim[] {
  const claims = Array.isArray(record.claimMap) ? record.claimMap : []
  return claims.filter((claim) => String(claim.reviewStatus ?? '').toLowerCase() === 'approved')
}

export function sourceMap(record: ResearchProfile): Map<string, ResearchSource> {
  const sources = Array.isArray(record.sources) ? record.sources : []
  return new Map(sources.filter((source) => source.id).map((source) => [String(source.id), source]))
}

export function uniqueSourceRefs(claim: ResearchClaim): string[] {
  return [...new Set(Array.isArray(claim.sourceRefIds) ? claim.sourceRefIds.map(String).filter(Boolean) : [])]
}

/**
 * Resolve source-row IDs to canonical study identities.
 *
 * A study can carry both a DOI and PMID, and legacy data can contain more than
 * one source row for the same study. Source-row counts therefore overstate
 * evidence independence. Alias-connected rows are collapsed into one component;
 * rows without a stable identifier remain distinct rather than being guessed at.
 */
export function canonicalStudyIdentityMap(record: ResearchProfile): Map<string, string> {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const parent = new Map<string, string>()

  const find = (value: string): string => {
    const current = parent.get(value) ?? value
    if (current === value) {
      parent.set(value, value)
      return value
    }
    const root = find(current)
    parent.set(value, root)
    return root
  }

  const union = (a: string, b: string) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA === rootB) return
    const [keep, merge] = [rootA, rootB].sort()
    parent.set(merge, keep)
  }

  for (const source of sources) {
    const aliases = citationIdentifiers(source)
    for (const alias of aliases) find(alias)
    for (let i = 1; i < aliases.length; i += 1) union(aliases[0], aliases[i])
  }

  const identities = new Map<string, string>()
  for (const source of sources) {
    const sourceId = String(source.id ?? '').trim()
    if (!sourceId) continue
    const aliases = citationIdentifiers(source)
    identities.set(sourceId, aliases.length ? find(aliases[0]) : `source-ref:${sourceId}`)
  }
  return identities
}

/** Stable studies supporting a claim, after collapsing duplicate/alias source rows. */
export function uniqueClaimStudyIdentities(
  claim: ResearchClaim,
  identities: Map<string, string>,
): string[] {
  return [...new Set(uniqueSourceRefs(claim).map((ref) => identities.get(ref)).filter((value): value is string => Boolean(value)))]
}
