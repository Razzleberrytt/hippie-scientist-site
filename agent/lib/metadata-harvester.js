import fs from 'node:fs'
import path from 'node:path'

import {
  CircuitBreaker,
  isTransientError,
  retryWithBackoff,
  runWorkerPool,
  withTimeout,
} from './runtime-resilience.js'

const cacheRoot = path.join(process.cwd(), 'agent', 'cache')
const REQUEST_TIMEOUT_MS = 15_000
const SOURCE_TASK_TIMEOUT_MS = 65_000
const MAX_RESULTS = 5
const CACHE_VERSION = 3
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const BATCH_CONCURRENCY = 4

const sourceCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  cooldownMs: 2 * 60 * 1000,
})

function cachePath(slug, source) {
  return path.join(cacheRoot, `${slug}-${source}.json`)
}

function loadCache(slug, source) {
  const file = cachePath(slug, source)

  if (!fs.existsSync(file)) return null

  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function saveCache(slug, source, data) {
  fs.mkdirSync(cacheRoot, { recursive: true })
  fs.writeFileSync(fileURL(slug, source), JSON.stringify(data, null, 2))
}

function parseRetryAfterMs(value, now = Date.now()) {
  if (!value) return 0

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return 0
  return Math.max(0, timestamp - now)
}

async function fetchJson(url) {
  return retryWithBackoff(async () => {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'hippie-scientist-site/1.0 (evidence metadata harvester)' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      const error = new Error(`Metadata request failed (${response.status}) for ${url.hostname}`)
      error.status = response.status
      error.retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'))
      throw error
    }

    return response.json()
  }, {
    attempts: 4,
    baseDelayMs: 750,
    maxDelayMs: 6_000,
    shouldRetry: isTransientError,
  })
}

function isFreshCache(value) {
  const harvestedAt = Date.parse(value?.harvested_at || '')
  return value?.cache_version === CACHE_VERSION && Number.isFinite(harvestedAt) && Date.now() - harvestedAt < CACHE_TTL_MS
}

function hasPubMedRows(value) {
  return isFreshCache(value) && Array.isArray(value?.articles)
}

function hasClinicalTrialRows(value) {
  return isFreshCache(value) && Array.isArray(value?.trial_metadata)
}

function titleMentionsTerm(title, term) {
  const normalizedTitle = String(title).toLowerCase().replaceAll('-', ' ')
  const normalizedTerm = String(term).toLowerCase().replaceAll('-', ' ')
  return normalizedTitle.includes(normalizedTerm)
}

function fileURL(slug, source) {
  return cachePath(slug, source)
}

export async function harvestPubMedMetadata({ slug }) {
  const cached = loadCache(slug, 'pubmed')
  if (hasPubMedRows(cached)) return cached

  const term = String(slug).replaceAll('-', ' ')
  const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')
  searchUrl.search = new URLSearchParams({
    db: 'pubmed',
    retmode: 'json',
    retmax: String(MAX_RESULTS),
    sort: 'pub date',
    term: `"${term}"[Title/Abstract] AND humans[MeSH Terms] AND (clinicaltrial[Filter] OR meta-analysis[Publication Type] OR systematic review[Publication Type])`,
  }).toString()

  const search = await fetchJson(searchUrl)
  const pmids = search?.esearchresult?.idlist || []
  let articles = []

  if (pmids.length) {
    const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi')
    summaryUrl.search = new URLSearchParams({
      db: 'pubmed',
      retmode: 'json',
      id: pmids.join(','),
    }).toString()
    const summary = await fetchJson(summaryUrl)
    articles = pmids.map(pmid => {
      const row = summary?.result?.[pmid] || {}
      const publicationTypes = Array.isArray(row.pubtype) ? row.pubtype : []
      const articleIds = Array.isArray(row.articleids) ? row.articleids : []
      return {
        pmid,
        doi: articleIds.find(id => id?.idtype === 'doi')?.value || '',
        title: row.title || '',
        publication_types: publicationTypes,
        study_type: classifyStudyType(publicationTypes.join(' ')),
        publication_date: row.pubdate || '',
      }
    }).filter(article => titleMentionsTerm(article.title, term))
  }

  const result = {
    cache_version: CACHE_VERSION,
    source: 'pubmed',
    slug,
    pmids,
    articles,
    harvested_at: new Date().toISOString(),
  }

  saveCache(slug, 'pubmed', result)

  return result
}

export async function harvestClinicalTrialsMetadata({ slug }) {
  const cached = loadCache(slug, 'clinicaltrials')
  if (hasClinicalTrialRows(cached)) return cached

  const term = String(slug).replaceAll('-', ' ')
  const url = new URL('https://clinicaltrials.gov/api/v2/studies')
  url.search = new URLSearchParams({
    'query.term': term,
    format: 'json',
    pageSize: String(MAX_RESULTS),
  }).toString()
  const payload = await fetchJson(url)
  const trialMetadata = (payload?.studies || []).map(study => {
    const protocol = study?.protocolSection || {}
    const identification = protocol.identificationModule || {}
    const design = protocol.designModule || {}
    const eligibility = protocol.eligibilityModule || {}
    const minimumAge = eligibility.minimumAge || ''
    const maximumAge = eligibility.maximumAge || ''
    return {
      nct_id: identification.nctId || '',
      title: identification.briefTitle || '',
      study_type: String(design.studyType || 'unknown').toLowerCase(),
      population: [eligibility.sex, minimumAge && maximumAge ? `${minimumAge}–${maximumAge}` : minimumAge || maximumAge]
        .filter(Boolean)
        .join(', ') || 'human participants',
      sample_size: String(design.enrollmentInfo?.count || ''),
      has_results: study?.hasResults === true,
    }
  }).filter(row => row.nct_id && row.has_results && titleMentionsTerm(row.title, term))

  const result = {
    cache_version: CACHE_VERSION,
    source: 'clinicaltrials',
    slug,
    trial_ids: trialMetadata.map(row => row.nct_id),
    trial_metadata: trialMetadata,
    harvested_at: new Date().toISOString(),
  }

  saveCache(slug, 'clinicaltrials', result)

  return result
}

export function classifyStudyType(text = '') {
  const value = String(text).toLowerCase()

  if (value.includes('meta-analysis')) return 'meta_analysis'
  if (value.includes('systematic review')) return 'systematic_review'
  if (value.includes('randomized')) return 'rct'
  if (value.includes('clinical trial')) return 'clinical_trial'
  if (value.includes('review')) return 'review'
  if (value.includes('double blind')) return 'double_blind_trial'
  if (value.includes('animal')) return 'animal'
  if (value.includes('in vitro')) return 'in_vitro'

  return 'unknown'
}

async function harvestSource({ source, slug, harvest, breaker, timeoutMs }) {
  const permission = breaker.canRun(source)
  if (!permission.allowed) {
    return {
      ok: false,
      source,
      skipped: true,
      reason: 'circuit_open',
      retryAfter: new Date(permission.reopenAt).toISOString(),
    }
  }

  try {
    const value = await withTimeout(
      () => harvest({ slug }),
      timeoutMs,
      `${source}:${slug}`
    )
    breaker.recordSuccess(source)
    return { ok: true, source, value }
  } catch (error) {
    breaker.recordFailure(source)
    return {
      ok: false,
      source,
      skipped: false,
      reason: error?.code === 'TASK_TIMEOUT' ? 'timeout' : 'source_error',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function harvestMetadataBatch({
  compounds = [],
  concurrency = BATCH_CONCURRENCY,
  timeoutMs = SOURCE_TASK_TIMEOUT_MS,
  breaker = sourceCircuitBreaker,
  harvestPubMed = harvestPubMedMetadata,
  harvestClinicalTrials = harvestClinicalTrialsMetadata,
} = {}) {
  const rows = await runWorkerPool(compounds, async compound => {
    const slug = compound?.slug || compound?.name
    if (!slug) {
      return {
        slug: 'unknown',
        metadata_sources: [],
        source_failures: [{ source: 'batch', reason: 'missing_slug' }],
        pubmed: null,
        clinical_trials: null,
      }
    }

    const [pubmed, clinicalTrials] = await Promise.all([
      harvestSource({ source: 'pubmed', slug, harvest: harvestPubMed, breaker, timeoutMs }),
      harvestSource({ source: 'clinicaltrials', slug, harvest: harvestClinicalTrials, breaker, timeoutMs }),
    ])

    const successful = [pubmed, clinicalTrials].filter(row => row.ok)
    const failed = [pubmed, clinicalTrials]
      .filter(row => !row.ok)
      .map(({ source, skipped, reason, retryAfter, error }) => ({ source, skipped, reason, retryAfter, error }))

    return {
      slug,
      metadata_sources: successful.map(row => row.source),
      source_failures: failed,
      pubmed: pubmed.ok ? pubmed.value : null,
      clinical_trials: clinicalTrials.ok ? clinicalTrials.value : null,
    }
  }, {
    concurrency,
  })

  return rows.map((row, index) => {
    if (row.ok) return row.value
    const compound = compounds[index] || {}
    return {
      slug: compound.slug || compound.name || 'unknown',
      metadata_sources: [],
      source_failures: [{
        source: 'batch',
        skipped: false,
        reason: 'unexpected_worker_error',
        error: row.error?.message || String(row.error),
      }],
      pubmed: null,
      clinical_trials: null,
    }
  })
}
