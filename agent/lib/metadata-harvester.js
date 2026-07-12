import fs from 'node:fs'
import path from 'node:path'

const cacheRoot = path.join(process.cwd(), 'agent', 'cache')
const REQUEST_TIMEOUT_MS = 15_000
const MAX_RESULTS = 5
const CACHE_VERSION = 3
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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

async function fetchJson(url, attempt = 0) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'hippie-scientist-site/1.0 (evidence metadata harvester)' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (response.status === 429 && attempt < 3) {
    const retryAfter = Number(response.headers.get('retry-after'))
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 750 * (attempt + 1)
    await new Promise(resolve => setTimeout(resolve, delay))
    return fetchJson(url, attempt + 1)
  }

  if (!response.ok) {
    throw new Error(`Metadata request failed (${response.status}) for ${url.hostname}`)
  }

  return response.json()
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

export async function harvestMetadataBatch({ compounds = [] }) {
  const results = []

  for (const compound of compounds) {
    const [pubmed, clinicalTrials] = await Promise.all([
      harvestPubMedMetadata({ slug: compound.slug || compound.name }),
      harvestClinicalTrialsMetadata({ slug: compound.slug || compound.name }),
    ])

    results.push({
      slug: compound.slug || compound.name,
      metadata_sources: ['pubmed', 'clinicaltrials'],
      pubmed,
      clinical_trials: clinicalTrials,
    })
  }

  return results
}
