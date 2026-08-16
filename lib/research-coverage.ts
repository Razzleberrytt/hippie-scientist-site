import fs from 'node:fs'
import path from 'node:path'

import { normalizeStudyClass, strongestStudyClass, type StudyClass } from './study-class'

export type ResearchSource = Record<string, unknown> & {
  id?: string
  pmid?: string
  pubmedId?: string
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
