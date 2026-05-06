export async function harvestPubMedMetadata({ slug }) {
  return {
    source: 'pubmed',
    slug,
    pmids: [],
    abstracts: [],
    study_types: [],
    harvested_at: new Date().toISOString(),
  }
}

export async function harvestClinicalTrialsMetadata({ slug }) {
  return {
    source: 'clinicaltrials',
    slug,
    trial_ids: [],
    trial_metadata: [],
    harvested_at: new Date().toISOString(),
  }
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
