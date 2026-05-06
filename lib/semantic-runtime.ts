import compoundsData from '../public/data/compounds.json'

export type RuntimeCompoundInput = {
  slug?: string
  name?: string
  title?: string
  summary?: string
  coreInsight?: string
  effects?: unknown
  effect?: unknown
  primary_effects?: unknown
  mechanisms?: unknown
  mechanism?: unknown
  safety?: unknown
  evidence?: unknown
  evidence_tier?: unknown
  sources?: unknown
  references?: unknown
  related_compounds?: unknown
  relatedCompounds?: unknown
  aliases?: unknown
  archetype?: string
  clusters?: unknown
}

export type RuntimeCompound = {
  slug: string
  name: string
  summary: string
  effects: string[]
  mechanisms: string[]
  evidence_tier: string
  safety: string
  sources: unknown[]
  related_compounds: string[]
  aliases: string[]
  archetype: string
  clusters: string[]
}

export type ScoredRuntimeCompound = RuntimeCompound & {
  relationship_score: number
  relationship_reason: string
}

function clean(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return ''
}

function slugify(value: unknown): string {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => splitList(entry))
      .map(clean)
      .filter(Boolean)
  }

  if (typeof value === 'object') return []

  return clean(value)
    .split(/[|;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()

  return values.filter((value) => {
    const key = value.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function sourceArray(value: unknown): unknown[] {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function textIncludesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

function inferArchetype(record: Pick<RuntimeCompound, 'effects' | 'mechanisms' | 'summary'>) {
  const text = JSON.stringify({
    effects: record.effects,
    mechanisms: record.mechanisms,
    summary: record.summary,
  }).toLowerCase()

  if (textIncludesAny(text, ['adaptogen', 'stress'])) return 'Adaptogen'
  if (textIncludesAny(text, ['focus', 'cognition', 'memory', 'attention'])) return 'Nootropic'
  if (textIncludesAny(text, ['exercise', 'muscle', 'recovery', 'performance'])) return 'Performance'
  if (textIncludesAny(text, ['anxiety', 'calm', 'relax', 'mood'])) return 'Calming'
  if (textIncludesAny(text, ['sleep', 'insomnia'])) return 'Sleep Support'
  if (textIncludesAny(text, ['inflammation', 'antioxidant'])) return 'Inflammation Support'

  return 'General Wellness'
}

function inferClusters(record: Pick<RuntimeCompound, 'effects' | 'mechanisms' | 'summary'>) {
  const text = [record.summary, ...record.effects, ...record.mechanisms].join(' ').toLowerCase()
  const clusters: string[] = []

  if (textIncludesAny(text, ['sleep', 'insomnia', 'latency'])) clusters.push('Sleep')
  if (textIncludesAny(text, ['focus', 'attention', 'memory', 'cognition'])) clusters.push('Focus')
  if (textIncludesAny(text, ['anxiety', 'stress', 'calm', 'mood'])) clusters.push('Stress & Mood')
  if (textIncludesAny(text, ['recovery', 'muscle', 'exercise', 'performance'])) clusters.push('Recovery')
  if (textIncludesAny(text, ['inflammation', 'oxidative', 'longevity', 'antioxidant'])) clusters.push('Longevity')

  return clusters.length ? clusters : ['General Wellness']
}

export function normalizeCompound(input: RuntimeCompoundInput): RuntimeCompound {
  const effects = unique(splitList(input.effects || input.primary_effects || input.effect))
  const mechanisms = unique(splitList(input.mechanisms || input.mechanism))
  const summary = clean(input.summary || input.coreInsight)

  const base = {
    slug: slugify(input.slug || input.name || input.title),
    name: clean(input.name || input.title || input.slug),
    summary: summary || 'No summary available yet.',
    effects,
    mechanisms,
    evidence_tier: clean(input.evidence_tier || input.evidence),
    safety: clean(
      typeof input.safety === 'object' && input.safety && 'notes' in input.safety
        ? (input.safety as { notes?: unknown }).notes
        : input.safety
    ),
    sources: sourceArray(input.sources || input.references),
    related_compounds: unique(splitList(input.related_compounds || input.relatedCompounds)),
    aliases: unique(splitList(input.aliases)),
    archetype: clean(input.archetype),
    clusters: unique(splitList(input.clusters)),
  }

  const inferredArchetype = base.archetype || inferArchetype(base)
  const inferredClusters = base.clusters.length ? base.clusters : inferClusters(base)

  return {
    ...base,
    archetype: inferredArchetype,
    clusters: inferredClusters,
  }
}

const compounds = (compoundsData as RuntimeCompoundInput[])
  .map(normalizeCompound)
  .filter((compound) => compound.slug && compound.name)

export function getAllCompoundsRuntime() {
  return compounds
}

export function getCompoundRuntime(slug: string) {
  const normalizedSlug = slugify(slug)
  return compounds.find((compound) => compound.slug === normalizedSlug)
}

export function getCompoundEffects(compound: RuntimeCompoundInput) {
  return normalizeCompound(compound).effects
}

export function getCompoundSources(compound: RuntimeCompoundInput) {
  return normalizeCompound(compound).sources
}

export function classifyArchetype(compound: RuntimeCompoundInput) {
  return normalizeCompound(compound).archetype
}

export function getTopicClusters(compound: RuntimeCompoundInput) {
  return normalizeCompound(compound).clusters
}

export function getRelatedCompounds(compound: RuntimeCompoundInput, limit = 6): ScoredRuntimeCompound[] {
  const normalized = normalizeCompound(compound)
  const baseEffects = new Set(normalized.effects.map((effect) => effect.toLowerCase()))
  const baseMechanisms = new Set(normalized.mechanisms.map((mechanism) => mechanism.toLowerCase()))
  const baseClusters = new Set(normalized.clusters.map((cluster) => cluster.toLowerCase()))

  return compounds
    .filter((candidate) => candidate.slug !== normalized.slug)
    .map((candidate) => {
      const effectOverlap = candidate.effects
        .map((effect) => effect.toLowerCase())
        .filter((effect) => baseEffects.has(effect)).length

      const mechanismOverlap = candidate.mechanisms
        .map((mechanism) => mechanism.toLowerCase())
        .filter((mechanism) => baseMechanisms.has(mechanism)).length

      const clusterOverlap = candidate.clusters
        .map((cluster) => cluster.toLowerCase())
        .filter((cluster) => baseClusters.has(cluster)).length

      const explicitRelated = normalized.related_compounds.includes(candidate.slug)
      const archetypeMatch = normalized.archetype === candidate.archetype ? 1 : 0
      const evidenceWeight = candidate.evidence_tier ? 1 : 0
      const score = effectOverlap * 3 + mechanismOverlap * 2 + clusterOverlap * 2 + archetypeMatch + evidenceWeight + (explicitRelated ? 4 : 0)

      const reasons = []
      if (explicitRelated) reasons.push('explicit workbook relationship')
      if (effectOverlap) reasons.push('shared effects')
      if (mechanismOverlap) reasons.push('shared mechanisms')
      if (clusterOverlap) reasons.push('shared goal cluster')
      if (archetypeMatch) reasons.push('similar archetype')

      return {
        ...candidate,
        relationship_score: score,
        relationship_reason: reasons.length ? `Related by ${reasons.join(', ')}` : 'Adjacent compound profile',
      }
    })
    .sort((a, b) => b.relationship_score - a.relationship_score || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function getStackCandidates(compound: RuntimeCompoundInput, limit = 4) {
  return getRelatedCompounds(compound, limit).map((candidate) => ({
    slug: candidate.slug,
    name: candidate.name,
    reason: candidate.relationship_reason,
    confidence: candidate.relationship_score >= 6 ? 'high' : candidate.relationship_score >= 3 ? 'moderate' : 'exploratory',
  }))
}

export function getComparisonCandidates(compound: RuntimeCompoundInput, limit = 4) {
  const normalized = normalizeCompound(compound)

  return getRelatedCompounds(normalized, limit).map((candidate) => ({
    slug: `${normalized.slug}-vs-${candidate.slug}`,
    href: `/compare/${normalized.slug}-vs-${candidate.slug}`,
    label: `${normalized.name} vs ${candidate.name}`,
  }))
}

export function getEvidenceSnapshot(compound: RuntimeCompoundInput) {
  const normalized = normalizeCompound(compound)
  const sourceCount = normalized.sources.length
  const effectCount = normalized.effects.length
  const mechanismCount = normalized.mechanisms.length

  return {
    archetype: normalized.archetype,
    clusters: normalized.clusters,
    citation_density: effectCount ? Number((sourceCount / effectCount).toFixed(2)) : sourceCount,
    source_count: sourceCount,
    effect_count: effectCount,
    mechanism_count: mechanismCount,
    freshness_score: sourceCount > 0 ? 0.6 : 0.25,
    human_evidence_ratio: normalized.evidence_tier ? 0.5 : 0,
  }
}
