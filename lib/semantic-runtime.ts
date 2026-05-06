import compoundsData from '../public/data/compounds.json'

export type RuntimeCompound = {
  slug: string
  name?: string
  summary?: string
  effects?: string[]
  primary_effects?: string[]
  mechanisms?: string[]
  safety?: any
  evidence_tier?: string
  sources?: any[]
  references?: any[]
}

const compounds = compoundsData as RuntimeCompound[]

function arr(value: any): any[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function textIncludesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

export function getCompoundRuntime(slug: string) {
  return compounds.find((compound) => compound.slug === slug)
}

export function getCompoundEffects(compound: RuntimeCompound) {
  return arr(compound.effects?.length ? compound.effects : compound.primary_effects)
    .map(String)
    .filter(Boolean)
}

export function getCompoundSources(compound: RuntimeCompound) {
  return arr(compound.sources?.length ? compound.sources : compound.references)
    .filter(Boolean)
}

export function classifyArchetype(compound: RuntimeCompound) {
  const text = JSON.stringify({
    effects: getCompoundEffects(compound),
    mechanisms: compound.mechanisms || [],
    summary: compound.summary || '',
  }).toLowerCase()

  if (textIncludesAny(text, ['adaptogen', 'stress'])) return 'Adaptogen'
  if (textIncludesAny(text, ['focus', 'cognition', 'memory', 'attention'])) return 'Nootropic'
  if (textIncludesAny(text, ['exercise', 'muscle', 'recovery'])) return 'Performance'
  if (textIncludesAny(text, ['anxiety', 'calm', 'relax'])) return 'Calming'
  if (textIncludesAny(text, ['inflammation', 'antioxidant'])) return 'Inflammation Support'

  return 'General Wellness'
}

export function getTopicClusters(compound: RuntimeCompound) {
  const text = getCompoundEffects(compound).join(' ').toLowerCase()
  const clusters: string[] = []

  if (textIncludesAny(text, ['sleep', 'insomnia'])) clusters.push('Sleep')
  if (textIncludesAny(text, ['focus', 'attention', 'memory', 'cognition'])) clusters.push('Focus')
  if (textIncludesAny(text, ['anxiety', 'stress', 'calm'])) clusters.push('Stress & Mood')
  if (textIncludesAny(text, ['recovery', 'muscle', 'exercise'])) clusters.push('Recovery')
  if (textIncludesAny(text, ['inflammation', 'oxidative', 'longevity'])) clusters.push('Longevity')

  return clusters.length ? clusters : ['General Wellness']
}

export function getRelatedCompounds(compound: RuntimeCompound, limit = 6) {
  const baseEffects = new Set(getCompoundEffects(compound).map((effect) => effect.toLowerCase()))
  const baseMechanisms = new Set(arr(compound.mechanisms).map((m) => String(m).toLowerCase()))

  return compounds
    .filter((candidate) => candidate.slug !== compound.slug)
    .map((candidate) => {
      const effectOverlap = getCompoundEffects(candidate)
        .map((effect) => effect.toLowerCase())
        .filter((effect) => baseEffects.has(effect)).length

      const mechanismOverlap = arr(candidate.mechanisms)
        .map((m) => String(m).toLowerCase())
        .filter((mechanism) => baseMechanisms.has(mechanism)).length

      const score = effectOverlap * 2 + mechanismOverlap

      return {
        ...candidate,
        relationship_score: score,
        relationship_reason:
          score > 0
            ? 'Shared effects or mechanisms'
            : 'Adjacent compound profile',
      }
    })
    .sort((a, b) => b.relationship_score - a.relationship_score)
    .slice(0, limit)
}

export function getStackCandidates(compound: RuntimeCompound, limit = 4) {
  return getRelatedCompounds(compound, limit).map((candidate) => ({
    slug: candidate.slug,
    name: candidate.name || candidate.slug,
    reason: candidate.relationship_reason || 'Potentially complementary profile',
    confidence: candidate.relationship_score > 0 ? 'moderate' : 'exploratory',
  }))
}

export function getComparisonCandidates(compound: RuntimeCompound, limit = 4) {
  return getRelatedCompounds(compound, limit).map((candidate) => ({
    slug: `${compound.slug}-vs-${candidate.slug}`,
    href: `/compare/${compound.slug}-vs-${candidate.slug}`,
    label: `${compound.name || compound.slug} vs ${candidate.name || candidate.slug}`,
  }))
}

export function getEvidenceSnapshot(compound: RuntimeCompound) {
  const sources = getCompoundSources(compound)
  const effects = getCompoundEffects(compound)

  return {
    archetype: classifyArchetype(compound),
    clusters: getTopicClusters(compound),
    citation_density: effects.length ? Number((sources.length / effects.length).toFixed(2)) : sources.length,
    source_count: sources.length,
    effect_count: effects.length,
    freshness_score: 0.5,
    human_evidence_ratio: 0,
  }
}
