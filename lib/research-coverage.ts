import fs from 'node:fs'
import path from 'node:path'

import {
  buildCitationIdentifierIdentityMap,
  canonicalCitationIdentifier,
  citationIdentifiers,
  normalizePmidList,
} from './citation-identifiers.mjs'
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

function normalizeResearchSourceIdentity(source: ResearchSource): ResearchSource {
  const explicitId = String(source.id ?? '').trim()
  if (explicitId) return source
  const [canonicalId] = citationIdentifiers(source)
  return canonicalId ? { ...source, id: canonicalId } : source
}

function normalizeResearchProfileSources(record: ResearchProfile): ResearchProfile {
  if (!Array.isArray(record.sources)) return record

  const sources: ResearchSource[] = []
  const sourceRefExpansion = new Map<string, string[]>()

  for (const rawSource of record.sources) {
    const source = normalizeResearchSourceIdentity(rawSource)
    const pmids = normalizePmidList(source.pmid ?? source.pubmedId)
    if (pmids.length <= 1) {
      sources.push(source)
      continue
    }

    const originalId = String(source.id ?? '').trim()
    const expandedIds: string[] = []
    for (let index = 0; index < pmids.length; index += 1) {
      const pmid = pmids[index]
      const id = originalId
        ? index === 0 ? originalId : `${originalId}::pmid:${pmid}`
        : `pmid:${pmid}`
      const splitSource: ResearchSource = {
        ...source,
        id,
        pmid,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      }
      delete splitSource.pubmedId
      delete splitSource.doi
      sources.push(splitSource)
      expandedIds.push(id)
    }
    if (originalId) sourceRefExpansion.set(originalId, expandedIds)
  }

  const claimMap = Array.isArray(record.claimMap)
    ? record.claimMap.map((claim) => ({
        ...claim,
        sourceRefIds: Array.isArray(claim.sourceRefIds)
          ? claim.sourceRefIds.flatMap((sourceRefId) => sourceRefExpansion.get(String(sourceRefId)) ?? [String(sourceRefId)])
          : claim.sourceRefIds,
      }))
    : record.claimMap

  return { ...record, sources, claimMap }
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
        const rawRecord = JSON.parse(fs.readFileSync(file, 'utf8')) as ResearchProfile
        const record = normalizeResearchProfileSources(rawRecord)
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

export function canonicalStudyIdentityMap(record: ResearchProfile): Map<string, string> {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const aliasIdentities = buildCitationIdentifierIdentityMap(sources)
  const identities = new Map<string, string>()

  for (const source of sources) {
    const sourceId = String(source.id ?? '').trim()
    if (!sourceId) continue
    const canonical = canonicalCitationIdentifier(source, aliasIdentities)
    identities.set(sourceId, canonical || `source-ref:${sourceId}`)
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

export function crossProfileStudyIdentityMap(
  profiles: readonly ResearchProfileEntry[],
): Map<string, string> {
  const allSources = profiles.flatMap(({ record }) => Array.isArray(record.sources) ? record.sources : [])
  const aliasIdentities = buildCitationIdentifierIdentityMap(allSources)
  const identities = new Map<string, string>()

  for (const { url, record } of profiles) {
    for (const [localStudyId, group] of canonicalStudyGroups(record)) {
      const globalStudyId = group
        .map((source) => canonicalCitationIdentifier(source, aliasIdentities))
        .find(Boolean) || `${url}::${localStudyId}`
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
