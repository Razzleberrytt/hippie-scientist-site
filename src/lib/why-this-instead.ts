import { formatDisplayLabel, text, unique } from '@/lib/display-utils'
import {
  buildDecisionVisualProfile,
  type DecisionVisualProfile,
  type RecoveryOrientation,
  type StimulationProfile,
  type TimelineProfile,
} from '@/lib/decision-visuals'

export type AlternativeReasoning = {
  source: {
    slug: string
    label: string
    href?: string
    visuals: DecisionVisualProfile
  }
  alternative: {
    slug: string
    label: string
    href?: string
    visuals: DecisionVisualProfile
  }
  rationale: string[]
  contrastChips: string[]
  fitFrame: string
}

type RuntimeRecord = Record<string, any>

const PROFILE_KIND: Record<string, 'herb' | 'compound'> = {
  ashwagandha: 'herb',
  rhodiola: 'herb',
  bacopa: 'herb',
  'lions-mane': 'herb',
  saffron: 'herb',
  creatine: 'compound',
  theanine: 'compound',
  glycine: 'compound',
  magnesium: 'compound',
  'magnesium-glycinate': 'compound',
  taurine: 'compound',
  nac: 'compound',
}

const PROFILE_LABELS: Record<string, string> = {
  'lions-mane': "Lion's Mane",
  nac: 'NAC',
}

const RELATIONSHIPS: Record<string, string[]> = {
  creatine: ['rhodiola', 'theanine', 'bacopa'],
  theanine: ['rhodiola', 'glycine', 'taurine'],
  rhodiola: ['theanine', 'ashwagandha', 'creatine'],
  ashwagandha: ['rhodiola', 'theanine', 'magnesium'],
  magnesium: ['glycine', 'theanine', 'taurine'],
  'magnesium-glycinate': ['glycine', 'theanine', 'taurine'],
  glycine: ['magnesium-glycinate', 'theanine', 'taurine'],
  bacopa: ['theanine', 'rhodiola', 'lions-mane'],
  'lions-mane': ['bacopa', 'creatine', 'rhodiola'],
  taurine: ['theanine', 'glycine', 'magnesium'],
  nac: ['creatine', 'taurine', 'ashwagandha'],
}

const SYNTHETIC_RECORDS: Record<string, RuntimeRecord> = {
  ...Object.fromEntries(
    Object.keys(PROFILE_KIND).map((slug) => [slug, { slug, name: PROFILE_LABELS[slug] || slug }]),
  ),
}

function normalizeSlug(value: unknown) {
  return text(value).toLowerCase().replace(/lion'?s? mane|lion’s mane/g, 'lions-mane').replace(/\s+/g, '-')
}

function labelFor(record: RuntimeRecord) {
  const slug = normalizeSlug(record?.slug || record?.name)
  return PROFILE_LABELS[slug] || formatDisplayLabel(record?.displayName || record?.name || record?.slug)
}

function hrefFor(slug: string) {
  const kind = PROFILE_KIND[slug]
  if (!kind) return undefined
  return `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}`
}

function makeNode(record: RuntimeRecord) {
  const slug = normalizeSlug(record?.slug || record?.name)
  return {
    slug,
    label: labelFor(record),
    href: hrefFor(slug),
    visuals: buildDecisionVisualProfile(record),
  }
}

function directionText(source: DecisionVisualProfile, alternative: DecisionVisualProfile) {
  const rationales: string[] = []

  if (source.stimulation !== alternative.stimulation) {
    rationales.push(`${source.stimulation} stimulation framing instead of a ${alternative.stimulation} profile.`)
  }

  if (source.timeline !== alternative.timeline) {
    rationales.push(`${source.timeline} expectation timeline rather than ${alternative.timeline} expectations.`)
  }

  if (source.recoveryOrientation !== alternative.recoveryOrientation) {
    rationales.push(`${source.recoveryOrientation} fit compared with a more ${alternative.recoveryOrientation} pathway.`)
  }

  if (source.difficulty !== alternative.difficulty) {
    rationales.push(`${source.difficulty} exploration style versus ${alternative.difficulty} framing.`)
  }

  if (source.responderVariability !== alternative.responderVariability) {
    rationales.push(`${source.responderVariability} response expectations instead of ${alternative.responderVariability} assumptions.`)
  }

  return rationales.slice(0, 4)
}

function fitFrameFor(source: DecisionVisualProfile, alternative: DecisionVisualProfile) {
  if (source.stimulation === 'calming' && alternative.stimulation === 'activating') {
    return 'Potentially better fit when stimulant sensitivity, evening use, or nervous-system downshifting matters more than an activating push.'
  }

  if (source.timeline === 'cumulative' && alternative.timeline === 'acute') {
    return 'Potentially better fit when the goal is consistency and recovery capacity rather than a same-day perceptual effect.'
  }

  if (source.recoveryOrientation === 'sleep-adjacent') {
    return 'Potentially better fit when sleep context and relaxation style are central to the decision.'
  }

  if (source.recoveryOrientation === 'performance-oriented') {
    return 'Potentially better fit when the decision is anchored in training load, energy buffering, or sustainable output.'
  }

  return 'Potentially better fit when this semantic profile matches the user context; not a universal superiority claim.'
}

export function buildAlternativeReasoning(sourceRecord: RuntimeRecord, alternativeRecord: RuntimeRecord): AlternativeReasoning {
  const source = makeNode(sourceRecord)
  const alternative = makeNode(alternativeRecord)
  const rationale = directionText(source.visuals, alternative.visuals)

  return {
    source,
    alternative,
    rationale: rationale.length > 0
      ? rationale
      : ['Different practical fit, expectation timeline, and tolerance context rather than a simple stronger/weaker ranking.'],
    contrastChips: unique([
      source.visuals.stimulation,
      source.visuals.timeline,
      source.visuals.recoveryOrientation,
      `vs ${alternative.visuals.stimulation}`,
      `vs ${alternative.visuals.timeline}`,
    ]).slice(0, 6),
    fitFrame: fitFrameFor(source.visuals, alternative.visuals),
  }
}

function candidatesFor(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = []) {
  const sourceSlug = normalizeSlug(sourceRecord?.slug || sourceRecord?.name)
  const bySlug = new Map<string, RuntimeRecord>()

  records.forEach((record) => {
    const slug = normalizeSlug(record?.slug || record?.name)
    if (slug && slug !== sourceSlug) bySlug.set(slug, record)
  })

  ;(RELATIONSHIPS[sourceSlug] || []).forEach((slug) => {
    if (!bySlug.has(slug)) bySlug.set(slug, SYNTHETIC_RECORDS[slug])
  })

  return Array.from(bySlug.values()).filter(Boolean)
}

function pickAlternative(sourceRecord: RuntimeRecord, records: RuntimeRecord[], predicate: (visuals: DecisionVisualProfile) => boolean) {
  return candidatesFor(sourceRecord, records).find((record) => predicate(buildDecisionVisualProfile(record))) || candidatesFor(sourceRecord, records)[0]
}

export function buildGentlerAlternative(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = []) {
  const alternative = pickAlternative(sourceRecord, records, (visuals) => visuals.stimulation === 'calming')
  return alternative ? buildAlternativeReasoning(sourceRecord, alternative) : null
}

export function buildMoreActivatingAlternative(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = []) {
  const alternative = pickAlternative(sourceRecord, records, (visuals) => visuals.stimulation === 'activating')
  return alternative ? buildAlternativeReasoning(sourceRecord, alternative) : null
}

export function buildMoreCumulativeAlternative(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = []) {
  const alternative = pickAlternative(sourceRecord, records, (visuals) => visuals.timeline === 'cumulative')
  return alternative ? buildAlternativeReasoning(sourceRecord, alternative) : null
}

export function buildBeginnerAlternative(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = []) {
  const alternative = pickAlternative(sourceRecord, records, (visuals) => visuals.difficulty === 'beginner-friendly')
  return alternative ? buildAlternativeReasoning(sourceRecord, alternative) : null
}

export function buildRecoveryAlternative(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = []) {
  const alternative = pickAlternative(sourceRecord, records, (visuals) => {
    const orientation: RecoveryOrientation = visuals.recoveryOrientation
    return orientation === 'recovery-oriented' || orientation === 'sleep-adjacent' || orientation === 'stress-modulating'
  })
  return alternative ? buildAlternativeReasoning(sourceRecord, alternative) : null
}

export function buildAlternativeReasoningSet(sourceRecord: RuntimeRecord, records: RuntimeRecord[] = [], limit = 3) {
  const source = buildDecisionVisualProfile(sourceRecord)
  const builders = source.stimulation === 'activating'
    ? [buildGentlerAlternative, buildBeginnerAlternative, buildMoreCumulativeAlternative, buildRecoveryAlternative]
    : [buildMoreActivatingAlternative, buildMoreCumulativeAlternative, buildGentlerAlternative, buildBeginnerAlternative, buildRecoveryAlternative]

  const seen = new Set<string>()
  return builders
    .map((builder) => builder(sourceRecord, records))
    .filter((item): item is AlternativeReasoning => Boolean(item))
    .filter((item) => {
      const key = `${item.source.slug}:${item.alternative.slug}`
      if (seen.has(key)) return false
      seen.add(key)
      return item.source.slug !== item.alternative.slug
    })
    .slice(0, limit)
}
