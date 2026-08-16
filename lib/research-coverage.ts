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

/**
 * Load one canonical PubMed cache view. Structured metadata remains the base
 * record, while the already-fetched abstract corpus is merged onto the same PMID
 * under `abstract`. Consumers therefore do not need a second loader or a second
 * source of truth when an analysis needs both metadata and publication text.
 */
export function loadPubmedCache(root = process.cwd()): PubmedCache {
  const cacheDir = path.join(root, 'ops', 'cache')
  const metadataPath = path.join(cacheDir, 'pubmed-metadata.json')
  const abstractsPath = path.join(cacheDir, 'pubmed-abstracts.json')
  const records: PubmedCache = {}

  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')).records ?? {}
      for (const [pmid, record] of Object.entries(metadata)) {
        records[String(pmid)] = record && typeof record === 'object'
          ? { ...(record as Record<string, unknown>) }
          : {}
      }
    } catch {
      // Metadata coverage is allowed to be partial; downstream audits expose it.
    }
  }

  if (fs.existsSync(abstractsPath)) {
    try {
      const abstracts = JSON.parse(fs.readFileSync(abstractsPath, 'utf8')).abstracts ?? {}
      for (const [pmid, abstract] of Object.entries(abstracts)) {
        if (typeof abstract !== 'string' || !abstract.trim()) continue
        records[String(pmid)] = {
          ...(records[String(pmid)] ?? {}),
          abstract: abstract.trim(),
        }
      }
    } catch {
      // Abstract coverage is optional; malformed cache data must not erase metadata.
    }
  }

  return records
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

function createIdentityUnion() {
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
  return { find, union }
}

export function canonicalStudyIdentityMap(record: ResearchProfile): Map<string, string> {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const { find, union } = createIdentityUnion()

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

export function canonicalStudyGroups(record: ResearchProfile): Map<string, ResearchSource[]> {
  const identities = canonicalStudyIdentityMap(record)
  const groups = new Map<string, ResearchSource[]>()
  for (const source of Array.isArray(record.sources) ? record.sources : []) {
    const sourceId = String(source.id ?? '').trim()
    if (!sourceId) continue
    const identity = identities.get(sourceId)
    if (!identity) continue
    const group = groups.get(identity) ?? []
    group.push(source)
    groups.set(identity, group)
  }
  return groups
}

/**
 * Resolve profile-local canonical study IDs onto one site-wide stable identity.
 * DOI/PMID aliases are unioned across every profile, so a study represented as
 * DOI+PMID on one page and PMID-only on another still collapses to one study.
 * Identifier-less rows remain profile-local to prevent coincidental source IDs
 * from different pages from being treated as the same publication.
 */
export function crossProfileStudyIdentityMap(
  profiles: readonly ResearchProfileEntry[],
): Map<string, string> {
  const { find, union } = createIdentityUnion()

  for (const { record } of profiles) {
    for (const source of Array.isArray(record.sources) ? record.sources : []) {
      const aliases = citationIdentifiers(source)
      for (const alias of aliases) find(alias)
      for (let i = 1; i < aliases.length; i += 1) union(aliases[0], aliases[i])
    }
  }

  const identities = new Map<string, string>()
  for (const { url, record } of profiles) {
    for (const [localStudyId, group] of canonicalStudyGroups(record)) {
      const aliases = [...new Set(group.flatMap((source) => citationIdentifiers(source)))]
      const globalStudyId = aliases.length ? find(aliases[0]) : `${url}::${localStudyId}`
      identities.set(`${url}::${localStudyId}`, globalStudyId)
    }
  }
  return identities
}

export function crossProfileStudyIdentity(
  url: string,
  localStudyId: string,
  identities: Map<string, string>,
): string {
  return identities.get(`${url}::${localStudyId}`) ?? `${url}::${localStudyId}`
}

export function canonicalStudyClass(group: ResearchSource[], cache: PubmedCache): StudyClass {
  return strongestStudyClass(group.map((source) => sourceStudyClass(source, cache)))
}

export function uniqueClaimStudyIdentities(
  claim: ResearchClaim,
  identities: Map<string, string>,
): string[] {
  return [...new Set(uniqueSourceRefs(claim).map((ref) => identities.get(ref)).filter((value): value is string => Boolean(value)))]
}
