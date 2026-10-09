/**
 * Research-source register is deliberately separate from public evidence admission.
 * It discovers the latest MAIN-merged, source-verified 500-record batch and exposes
 * source identity/provenance only. Unmerged PRs are never visible to this loader.
 */
import 'server-only'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'

const DIR = 'ops/enrichment-submissions/reconciliation'
const BATCH_SIZE = 500

export type RegisteredResearchSource = {
  wave: number
  pmid: string
  title: string
  journal: string
  year: string
  category: string
  doi: string
  abstract: string
  pubType: string
}
export type PublicResearchSource = Omit<RegisteredResearchSource, 'abstract' | 'pubType'>
export type ResearchSourceRegister = {
  throughWave: number
  totalIndexedPmids: number
  latestSourceVerified: number
  priorPmidOnly: number
  priorIndexHref: string
  records: RegisteredResearchSource[]
  previousPmids: string[]
  categories: Array<{ key: string; count: number }>
}
type SourceRecord = {
  wave: number; pmid: string; title: string; verified_title: string; abstract: string; doi?: string
  verified_journal?: string; journal?: string; pub_date?: string; verified_pub_date?: string
  category: string; pub_type?: string; title_verified: boolean; abstract_verified: boolean; research_only: boolean
}
type IndexFile = { through_wave: number; total_unique_pmids: number; previous_unique_pmids: number; pmids: string[] }
type ManifestFile = {
  range: string; research_only: boolean; accepted_new_unique_pmids: number; cumulative_unique_pmids: number
  admission_policy: { published_entities: boolean; recommendations: boolean; runtime_admission: boolean; dosing_claims?: boolean }
  artifact_parts: Array<{ path: string; blob_sha: string; rows: number }>
  cumulative_index?: string
}
type StatusFile = { research_only: boolean; published: boolean; verified_rows: number }

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error('Research source register: ' + message)
}
function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, 'utf8')) as T }
function gitBlobSha(data: Buffer): string {
  return createHash('sha1').update('blob ' + data.byteLength + '\0').update(data).digest('hex')
}
function normalizeTitle(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
function normalizeDoi(value: string) {
  return value.trim().toLowerCase().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)/, '')
}
function parseRange(value: string) {
  const match = String(value || '').match(/^(\d+)-(\d+)$/)
  if (!match) return null
  const start = Number(match[1]), end = Number(match[2])
  if (end - start + 1 !== BATCH_SIZE) return null
  return { start, end }
}
function latestBatch() {
  const candidates = readdirSync(DIR)
    .filter(name => name.endsWith('-final-manifest.json'))
    .flatMap(name => {
      try {
        const manifest = readJson<ManifestFile>(join(DIR, name))
        const range = parseRange(manifest.range)
        if (!range || manifest.research_only !== true || manifest.accepted_new_unique_pmids !== BATCH_SIZE) return []
        const statusName = name.replace(/-final-manifest\.json$/, '-final-status.json')
        const indexName = manifest.cumulative_index
          ? basename(manifest.cumulative_index)
          : name.replace(/-final-manifest\.json$/, '-pmid-index.json')
        const status = readJson<StatusFile>(join(DIR, statusName))
        const index = readJson<IndexFile>(join(DIR, indexName))
        if (!status.research_only || status.published !== false || status.verified_rows !== BATCH_SIZE) return []
        if (index.through_wave !== range.end || index.total_unique_pmids !== manifest.cumulative_unique_pmids) return []
        return [{ name, manifest, statusName, indexName, index, ...range }]
      } catch { return [] }
    })
    .sort((a, b) => b.end - a.end)
  assert(candidates.length > 0, 'no valid merged source batch found')
  return candidates[0]
}
function artifactPath(value: string) {
  assert(value.startsWith(DIR + '/'), 'artifact path outside research directory')
  const rel = value.slice(DIR.length + 1)
  assert(Boolean(rel) && !rel.includes('..') && !rel.includes('/') && /^[a-zA-Z0-9._-]+$/.test(rel), 'unsafe artifact path')
  return join(DIR, rel)
}

let cached: ResearchSourceRegister | null = null
export function getResearchSourceRegister(): ResearchSourceRegister {
  if (cached) return cached
  const batch = latestBatch(), manifest = batch.manifest, index = batch.index
  assert(manifest.cumulative_unique_pmids === index.total_unique_pmids, 'manifest/index count mismatch')
  assert(manifest.artifact_parts?.length > 0, 'missing pinned receipt parts')
  assert(!manifest.admission_policy.published_entities && !manifest.admission_policy.recommendations &&
    !manifest.admission_policy.runtime_admission && !manifest.admission_policy.dosing_claims,
    'evidence admission boundary violated')

  const rows: SourceRecord[] = []
  for (const artifact of manifest.artifact_parts) {
    const file = artifactPath(artifact.path)
    const content = readFileSync(file)
    assert(gitBlobSha(content) === artifact.blob_sha, 'source receipt SHA mismatch')
    const parsed = JSON.parse(content.toString('utf8')) as { exact_verified_rows?: number; failures?: unknown[]; rows?: SourceRecord[] }
    assert(parsed.exact_verified_rows === artifact.rows && parsed.rows?.length === artifact.rows &&
      (parsed.failures?.length ?? 0) === 0, 'incomplete exact-source receipt')
    rows.push(...parsed.rows)
  }
  assert(rows.length === BATCH_SIZE, 'latest source batch must contain exactly 500 records')

  const indexed = new Set(index.pmids.map(String)), seen = new Set<string>(), titles = new Set<string>(), dois = new Set<string>()
  const categories = new Map<string, number>()
  const records: RegisteredResearchSource[] = rows.map((row, i) => {
    const pmid = String(row.pmid), titleKey = normalizeTitle(row.title), doi = normalizeDoi(row.doi || '')
    assert(row.wave === batch.start + i && /^\d{5,10}$/.test(pmid) && indexed.has(pmid) && !seen.has(pmid), 'wave/PMID identity mismatch')
    assert(row.research_only === true && row.title_verified === true && row.abstract_verified === true &&
      row.abstract.length >= 70 && normalizeTitle(row.verified_title) === titleKey && Boolean(titleKey),
      'unverified research metadata')
    assert(!titles.has(titleKey) && (!doi || !dois.has(doi)), 'duplicated source identity')
    seen.add(pmid); titles.add(titleKey); if (doi) dois.add(doi)
    assert(/^[a-z][a-z0-9_]*$/.test(row.category), 'invalid research category')
    categories.set(row.category, (categories.get(row.category) || 0) + 1)
    const date = row.verified_pub_date || row.pub_date || ''
    return { wave: row.wave, pmid, title: row.title, journal: row.verified_journal || row.journal || '',
      year: date.match(/(?:19|20)\d{2}/)?.[0] || '', category: row.category, doi, abstract: row.abstract, pubType: row.pub_type || '' }
  })

  const previousPmids = index.pmids.map(String).filter(pmid => !seen.has(pmid))
  assert(seen.size === BATCH_SIZE && previousPmids.length === index.total_unique_pmids - BATCH_SIZE &&
    indexed.size === index.total_unique_pmids, 'source count or index collision')
  cached = {
    throughWave: batch.end,
    totalIndexedPmids: index.total_unique_pmids,
    latestSourceVerified: BATCH_SIZE,
    priorPmidOnly: previousPmids.length,
    priorIndexHref: '/data/research/pmid-register-through-' + (batch.start - 1) + '.json',
    records,
    previousPmids,
    categories: [...categories.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
  }
  return cached
}
export function getResearchSourceRegisterSummary() {
  const batch = latestBatch()
  return { totalIndexedPmids: batch.index.total_unique_pmids, throughWave: batch.index.through_wave }
}
