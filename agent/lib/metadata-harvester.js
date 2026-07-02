import fs from 'node:fs'
import path from 'node:path'

const cacheRoot = path.join(process.cwd(), 'agent', 'cache')

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

function fileURL(slug, source) {
  return cachePath(slug, source)
}

export async function harvestPubMedMetadata({ slug }) {
  const cached = loadCache(slug, 'pubmed')
  if (cached) return cached

  const result = {
    source: 'pubmed',
    slug,
    pmids: [],
    abstracts: [],
    study_types: [],
    harvested_at: new Date().toISOString(),
  }

  saveCache(slug, 'pubmed', result)

  return result
}

export async function harvestClinicalTrialsMetadata({ slug }) {
  const cached = loadCache(slug, 'clinicaltrials')
  if (cached) return cached

  const result = {
    source: 'clinicaltrials',
    slug,
    trial_ids: [],
    trial_metadata: [],
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
  if (value.includes('double blind')) return 'double_blind_trial'
  if (value.includes('animal')) return 'animal'
  if (value.includes('in vitro')) return 'in_vitro'

  return 'unknown'
}

export async function harvestMetadataBatch({ compounds = [] }) {
  const jobs = compounds.map(async compound => {
    const [pubmed, clinicalTrials] = await Promise.all([
      harvestPubMedMetadata({ slug: compound.slug || compound.name }),
      harvestClinicalTrialsMetadata({ slug: compound.slug || compound.name }),
    ])

    return {
      slug: compound.slug || compound.name,
      metadata_sources: ['pubmed', 'clinicaltrials'],
      pubmed,
      clinical_trials: clinicalTrials,
    }
  })

  return Promise.all(jobs)
}
