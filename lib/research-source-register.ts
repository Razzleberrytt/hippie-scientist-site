/**
 * Research-source register is deliberately separate from public evidence admission.
 * It exposes source identity/provenance ONLY, never claim direction, evidence grade,
 * efficacy, dosing, or the existing runtime Citation Explorer's metrics.
 *
 * The latest MAIN-merged 7001–7500 batch is pinned here intentionally.
 * An unmerged research PR cannot silently become public via this loader.
 */
import 'server-only'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'ops/enrichment-submissions/reconciliation'
const PREFIX = '2026-10-07-enrichment-waves-7001-7500'
const FIRST_WAVE = 7001
const LAST_WAVE = 7500
const BATCH_SIZE = 500

export type RegisteredResearchSource = {
  wave: number
  pmid: string
  title: string
  journal: string
  year: string
  category: string
  doi: string
  /** Build-only source abstract: excluded from the client-facing bibliographic list. */
  abstract: string
  pubType: string
}

/** Browser-facing source identity omits full unreviewed abstract text. */
export type PublicResearchSource = Omit<RegisteredResearchSource, 'abstract' | 'pubType'>

export type ResearchSourceRegister = {
  throughWave: number
  totalIndexedPmids: number
  latestSourceVerified: number
  priorPmidOnly: number
  records: RegisteredResearchSource[]
  previousPmids: string[]
  categories: Array<{ key: string; count: number }>
}

type SourceRecord = {
  wave: number
  pmid: string
  title: string
  verified_title: string
  abstract: string
  doi?: string
  verified_journal?: string
  journal?: string
  pub_date?: string
  verified_pub_date?: string
  category: string
  pub_type?: string
  title_verified: boolean
  abstract_verified: boolean
  research_only: boolean
}

function pathFor(file: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(file)) throw new Error('Unsafe research artifact filename')
  return join(process.cwd(), DIR, file)
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(pathFor(name), 'utf8')) as T
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error('Research source register: ' + message)
}

function gitBlobSha(data: Buffer): string {
  return createHash('sha1')
    .update('blob ' + data.byteLength + '\0')
    .update(data)
    .digest('hex')
}

function normalizeTitle(value: string) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function normalizeDoi(value: string) {
  return value.trim().toLowerCase()
    .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/, '')
}

type IndexFile = {
  through_wave: number
  total_unique_pmids: number
  previous_unique_pmids: number
  pmids: string[]
}
type ManifestFile = {
  range: string
  research_only: boolean
  accepted_new_unique_pmids: number
  cumulative_unique_pmids: number
  admission_policy: { published_entities: boolean; recommendations: boolean; runtime_admission: boolean }
  artifact_parts: Array<{ path: string; blob_sha: string; rows: number }>
}
type PartFile = {
  exact_verified_rows: number
  failures: unknown[]
  rows: SourceRecord[]
}
type StatusFile = { research_only: boolean; published: boolean; verified_rows: number }

let cached: ResearchSourceRegister | null = null

export function getResearchSourceRegister(): ResearchSourceRegister {
  if (cached) return cached

  const manifest = readJson<ManifestFile>(PREFIX + '-final-manifest.json')
  const index = readJson<IndexFile>(PREFIX + '-pmid-index.json')
  const status = readJson<StatusFile>(PREFIX + '-final-status.json')

  assert(manifest.range === '7001-7500' && manifest.research_only === true, 'invalid batch manifest')
  assert(manifest.accepted_new_unique_pmids === BATCH_SIZE &&
    manifest.cumulative_unique_pmids === 7435, 'incorrect manifest counts')
  assert(!manifest.admission_policy.published_entities &&
    !manifest.admission_policy.recommendations &&
    !manifest.admission_policy.runtime_admission, 'evidence admission boundary violated')
  assert(status.research_only && status.published === false &&
    status.verified_rows === BATCH_SIZE, 'source status is not research-only')
  assert(index.through_wave === LAST_WAVE && index.total_unique_pmids === 7435 &&
    index.previous_unique_pmids === 6935 && index.pmids.length === 7435,
    'incorrect cumulative index')
  assert(manifest.artifact_parts?.length === 5, 'expected five pinned receipt parts')

  const rows: SourceRecord[] = []
  for (let part = 0; part < 5; part += 1) {
    const name = PREFIX + '-efetch-verified-part-0' + (part + 1) + '.json'
    const artifact = manifest.artifact_parts[part]
    assert(artifact.path === DIR + '/' + name && artifact.rows === 100, 'receipt path/count mismatch')
    const content = readFileSync(pathFor(name))
    assert(gitBlobSha(content) === artifact.blob_sha, 'source receipt SHA mismatch')
    const parsed = JSON.parse(content.toString('utf8')) as PartFile
    assert(parsed.exact_verified_rows === 100 && parsed.rows.length === 100 &&
      parsed.failures.length === 0, 'incomplete exact-source receipt')
    rows.push(...parsed.rows)
  }

  const indexed = new Set(index.pmids.map(String))
  const seen = new Set<string>()
  const titles = new Set<string>()
  const dois = new Set<string>()
  const categories = new Map<string, number>()
  const records: RegisteredResearchSource[] = rows.map((row, i) => {
    const pmid = String(row.pmid)
    const titleKey = normalizeTitle(row.title)
    const doi = normalizeDoi(row.doi || '')
    assert(row.wave === FIRST_WAVE + i && /^\d{5,10}$/.test(pmid) &&
      indexed.has(pmid) && !seen.has(pmid), 'wave/PMID identity mismatch')
    assert(row.research_only === true && row.title_verified === true &&
      row.abstract_verified === true && row.abstract.length >= 70 &&
      normalizeTitle(row.verified_title) === titleKey && Boolean(titleKey),
      'unverified research metadata')
    assert(!titles.has(titleKey) && (!doi || !dois.has(doi)), 'duplicated source identity')
    seen.add(pmid)
    titles.add(titleKey)
    if (doi) dois.add(doi)
    assert(/^[a-z][a-z0-9_]*$/.test(row.category), 'invalid research category')
    categories.set(row.category, (categories.get(row.category) || 0) + 1)
    const date = row.verified_pub_date || row.pub_date || ''
    return {
      wave: row.wave,
      pmid,
      title: row.title,
      journal: row.verified_journal || row.journal || '',
      year: date.match(/(?:19|20)\d{2}/)?.[0] || '',
      category: row.category,
      doi,
      abstract: row.abstract,
      pubType: row.pub_type || '',
    }
  })

  const previousPmids = index.pmids.map(String).filter(pmid => !seen.has(pmid))
  assert(seen.size === BATCH_SIZE && previousPmids.length === 6935 &&
    indexed.size === 7435, 'source count or index collision')

  cached = {
    throughWave: LAST_WAVE,
    totalIndexedPmids: index.total_unique_pmids,
    latestSourceVerified: BATCH_SIZE,
    priorPmidOnly: previousPmids.length,
    records,
    previousPmids,
    categories: [...categories.entries()].map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
  }
  return cached
}

/** Efficient count-only lookup for home and research navigation. */
export function getResearchSourceRegisterSummary() {
  const index = readJson<IndexFile>(PREFIX + '-pmid-index.json')
  assert(index.through_wave === LAST_WAVE && index.total_unique_pmids === 7435 &&
    index.pmids.length === 7435, 'research count is not authoritative')
  return { totalIndexedPmids: index.total_unique_pmids, throughWave: index.through_wave }
}
