const HIGH_VALUE_COMPOUNDS = new Map([
  ['ashwagandha', { search: 95, affiliate: 85 }],
  ['berberine', { search: 92, affiliate: 88 }],
  ['creatine', { search: 98, affiliate: 80 }],
  ['magnesium', { search: 96, affiliate: 82 }],
  ['magnesium-glycinate', { search: 94, affiliate: 84 }],
  ['rhodiola', { search: 78, affiliate: 75 }],
  ['rhodiola-rosea', { search: 78, affiliate: 75 }],
  ['nac', { search: 76, affiliate: 70 }],
  ['n-acetylcysteine', { search: 76, affiliate: 70 }],
  ['l-theanine', { search: 90, affiliate: 78 }],
])

function normalizeSlug(value = '') {
  return String(value).trim().toLowerCase()
}

function estimateEvidenceDepth(compound = {}) {
  const evidenceCount = Array.isArray(compound.evidence) ? compound.evidence.length : 0
  const sourceCount = Array.isArray(compound.sources) ? compound.sources.length : 0
  const pmidCount = Array.isArray(compound.pmids) ? compound.pmids.length : 0
  return Math.min(100, (evidenceCount * 10) + (sourceCount * 8) + (pmidCount * 8))
}

function estimateContentGap(compound = {}) {
  let gap = 0
  if (!compound.summary) gap += 25
  if (!compound.safety) gap += 20
  if (!compound.effects?.length && !compound.primary_effects?.length) gap += 20
  if (!compound.sources?.length && !compound.pmids?.length) gap += 20
  if (!compound.mechanisms?.length) gap += 15
  return Math.min(100, gap)
}

function estimateExistingEnrichment(compound = {}) {
  let score = 0
  if (compound.summary) score += 20
  if (compound.safety) score += 20
  if (compound.effects?.length || compound.primary_effects?.length) score += 20
  if (compound.sources?.length || compound.pmids?.length) score += 20
  if (compound.mechanisms?.length) score += 20
  return Math.min(100, score)
}

export function scoreCompoundPriority(compound = {}) {
  const slug = normalizeSlug(compound.slug || compound.name)
  const known = HIGH_VALUE_COMPOUNDS.get(slug) || { search: 45, affiliate: 40 }
  const evidenceDepth = estimateEvidenceDepth(compound)
  const contentGap = estimateContentGap(compound)
  const existingEnrichment = estimateExistingEnrichment(compound)

  return {
    slug,
    score: Math.round(
      (known.search * 0.28) +
      (known.affiliate * 0.22) +
      (evidenceDepth * 0.18) +
      (contentGap * 0.22) +
      ((100 - existingEnrichment) * 0.10)
    ),
    factors: {
      search_volume_proxy: known.search,
      affiliate_value: known.affiliate,
      evidence_depth: evidenceDepth,
      content_gap: contentGap,
      existing_enrichment_presence: existingEnrichment,
    },
  }
}

export function prioritizeCompounds(compounds = []) {
  return compounds
    .map(compound => ({ compound, priority: scoreCompoundPriority(compound) }))
    .sort((a, b) => b.priority.score - a.priority.score)
}

export function getPriorityQueue(compounds = [], limit = 20) {
  return prioritizeCompounds(compounds).slice(0, limit)
}
