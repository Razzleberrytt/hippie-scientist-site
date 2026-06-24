import { list, text, unique } from '@/lib/display-utils'

export type StimulationProfile = 'calming' | 'balanced' | 'activating'
export type TimelineProfile = 'acute' | 'mixed' | 'cumulative'
export type BeginnerDifficulty = 'beginner-friendly' | 'context-sensitive' | 'advanced experimentation'
export type StackComplexity = 'simple' | 'moderate' | 'aggressive'
export type ResponderVariabilityLevel = 'relatively consistent' | 'moderately variable' | 'highly context-dependent'
export type RecoveryOrientation =
  | 'recovery-oriented'
  | 'cognition-oriented'
  | 'sleep-adjacent'
  | 'performance-oriented'
  | 'stress-modulating'

export type DecisionVisualProfile = {
  stimulation: StimulationProfile
  timeline: TimelineProfile
  difficulty: BeginnerDifficulty
  stackComplexity: StackComplexity
  responderVariability: ResponderVariabilityLevel
  recoveryOrientation: RecoveryOrientation
  tags: string[]
}

type RuntimeRecord = Record<string, any>

const CALMING_TERMS = [
  'calm',
  'relax',
  'sleep',
  'sedat',
  'anxiety',
  'stress',
  'gaba',
  'glycine',
  'magnesium',
  'theanine',
]
const ACTIVATING_TERMS = [
  'energy',
  'stimul',
  'focus',
  'alert',
  'performance',
  'adaptogen',
  'dopamine',
  'rhodiola',
  'caffeine',
]
const ACUTE_TERMS = ['acute', 'same day', 'within', 'onset', 'notice', 'calm focus', 'relaxation']
const CUMULATIVE_TERMS = ['cumulative', 'weeks', 'consistent', 'training', 'memory', 'adaptation', 'resilience', 'creatine', 'bacopa', 'lion']
const CAUTION_TERMS = ['interaction', 'contraindication', 'avoid', 'caution', 'pregnancy', 'liver', 'kidney', 'sedat', 'bleed', 'thyroid']
const VARIABILITY_TERMS = ['variable', 'context', 'individual', 'depends', 'may', 'mixed', 'tolerance', 'sensitive']

const PROFILE_OVERRIDES: Record<string, Partial<DecisionVisualProfile>> = {
  creatine: {
    stimulation: 'balanced',
    timeline: 'cumulative',
    difficulty: 'beginner-friendly',
    stackComplexity: 'simple',
    responderVariability: 'relatively consistent',
    recoveryOrientation: 'performance-oriented',
  },
  theanine: {
    stimulation: 'calming',
    timeline: 'acute',
    difficulty: 'beginner-friendly',
    stackComplexity: 'simple',
    responderVariability: 'relatively consistent',
    recoveryOrientation: 'cognition-oriented',
  },
  glycine: {
    stimulation: 'calming',
    timeline: 'acute',
    difficulty: 'beginner-friendly',
    stackComplexity: 'simple',
    responderVariability: 'moderately variable',
    recoveryOrientation: 'sleep-adjacent',
  },
  magnesium: {
    stimulation: 'calming',
    timeline: 'mixed',
    difficulty: 'beginner-friendly',
    stackComplexity: 'simple',
    responderVariability: 'moderately variable',
    recoveryOrientation: 'recovery-oriented',
  },
  'magnesium-glycinate': {
    stimulation: 'calming',
    timeline: 'mixed',
    difficulty: 'beginner-friendly',
    stackComplexity: 'simple',
    responderVariability: 'moderately variable',
    recoveryOrientation: 'sleep-adjacent',
  },
  rhodiola: {
    stimulation: 'activating',
    timeline: 'mixed',
    difficulty: 'context-sensitive',
    stackComplexity: 'moderate',
    responderVariability: 'highly context-dependent',
    recoveryOrientation: 'stress-modulating',
  },
  ashwagandha: {
    stimulation: 'balanced',
    timeline: 'cumulative',
    difficulty: 'context-sensitive',
    stackComplexity: 'moderate',
    responderVariability: 'moderately variable',
    recoveryOrientation: 'stress-modulating',
  },
  bacopa: {
    stimulation: 'calming',
    timeline: 'cumulative',
    difficulty: 'context-sensitive',
    stackComplexity: 'moderate',
    responderVariability: 'moderately variable',
    recoveryOrientation: 'cognition-oriented',
  },
  'lions-mane': {
    stimulation: 'balanced',
    timeline: 'cumulative',
    difficulty: 'context-sensitive',
    stackComplexity: 'moderate',
    responderVariability: 'highly context-dependent',
    recoveryOrientation: 'cognition-oriented',
  },
  'lion’s-mane': {
    stimulation: 'balanced',
    timeline: 'cumulative',
    difficulty: 'context-sensitive',
    stackComplexity: 'moderate',
    responderVariability: 'highly context-dependent',
    recoveryOrientation: 'cognition-oriented',
  },
  taurine: {
    stimulation: 'calming',
    timeline: 'mixed',
    difficulty: 'beginner-friendly',
    stackComplexity: 'simple',
    responderVariability: 'moderately variable',
    recoveryOrientation: 'recovery-oriented',
  },
  nac: {
    stimulation: 'balanced',
    timeline: 'cumulative',
    difficulty: 'context-sensitive',
    stackComplexity: 'moderate',
    responderVariability: 'highly context-dependent',
    recoveryOrientation: 'recovery-oriented',
  },
}

function corpus(record: RuntimeRecord) {
  return [
    record?.slug,
    record?.name,
    record?.displayName,
    record?.summary,
    record?.description,
    record?.short_earthy_summary,
    record?.time_to_notice,
    record?.timeToNotice,
    record?.evidence_snapshot,
    record?.safety_snapshot,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topic_ecosystems),
    ...list(record?.best_for),
    ...list(record?.avoid_if),
  ]
    .map((value) => text(value).toLowerCase())
    .filter(Boolean)
    .join(' ')
}

function hasAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term))
}

function score(source: string, terms: string[]) {
  return terms.reduce((total, term) => total + (source.includes(term) ? 1 : 0), 0)
}

function slugOf(record: RuntimeRecord) {
  return text(record?.slug || record?.name || record?.displayName).toLowerCase()
}

function explicit<T extends string>(record: RuntimeRecord, keys: string[], allowed: readonly T[]): T | null {
  const values = keys.map((key) => text(record?.[key]).toLowerCase()).filter(Boolean)
  return allowed.find((value) => values.includes(value)) || null
}

export function getStimulationProfile(record: RuntimeRecord = {}): StimulationProfile {
  const allowed = ['calming', 'balanced', 'activating'] as const
  const value = explicit(record, ['stimulationProfile', 'stimulation_profile', 'stimulation'], allowed)
  if (value) return value

  const override = PROFILE_OVERRIDES[slugOf(record)]?.stimulation
  if (override) return override

  const source = corpus(record)
  const calming = score(source, CALMING_TERMS)
  const activating = score(source, ACTIVATING_TERMS)

  if (activating >= calming + 2) return 'activating'
  if (calming >= activating + 1) return 'calming'
  return 'balanced'
}

export function getTimelineProfile(record: RuntimeRecord = {}): TimelineProfile {
  const allowed = ['acute', 'mixed', 'cumulative'] as const
  const value = explicit(record, ['timelineProfile', 'timeline_profile', 'timeline'], allowed)
  if (value) return value

  const override = PROFILE_OVERRIDES[slugOf(record)]?.timeline
  if (override) return override

  const source = corpus(record)
  const acute = score(source, ACUTE_TERMS)
  const cumulative = score(source, CUMULATIVE_TERMS)

  if (cumulative >= acute + 2) return 'cumulative'
  if (acute >= cumulative + 1) return 'acute'
  return 'mixed'
}

export function getBeginnerDifficulty(record: RuntimeRecord = {}): BeginnerDifficulty {
  const override = PROFILE_OVERRIDES[slugOf(record)]?.difficulty
  if (override) return override

  const source = corpus(record)
  if (hasAny(source, CAUTION_TERMS) && hasAny(source, ACTIVATING_TERMS)) return 'advanced experimentation'
  if (hasAny(source, CAUTION_TERMS) || getResponderVariabilityLevel(record) === 'highly context-dependent') return 'context-sensitive'
  return getStimulationProfile(record) === 'activating' ? 'context-sensitive' : 'beginner-friendly'
}

export function getStackComplexity(record: RuntimeRecord = {}): StackComplexity {
  const override = PROFILE_OVERRIDES[slugOf(record)]?.stackComplexity
  if (override) return override

  const source = corpus(record)
  const cautions = score(source, CAUTION_TERMS)
  const stacks = list(record?.stacks || record?.stacking || record?.stack_guidance).length
  if (cautions >= 2 || stacks >= 5 || getBeginnerDifficulty(record) === 'advanced experimentation') return 'aggressive'
  if (cautions > 0 || stacks >= 2 || getTimelineProfile(record) === 'cumulative') return 'moderate'
  return 'simple'
}

export function getResponderVariabilityLevel(record: RuntimeRecord = {}): ResponderVariabilityLevel {
  const override = PROFILE_OVERRIDES[slugOf(record)]?.responderVariability
  if (override) return override

  const source = corpus(record)
  const variability = score(source, VARIABILITY_TERMS)
  if (variability >= 4 || hasAny(source, ['adaptogen', 'hormone', 'thyroid'])) return 'highly context-dependent'
  if (variability >= 2 || getTimelineProfile(record) === 'mixed') return 'moderately variable'
  return 'relatively consistent'
}

export function getRecoveryOrientation(record: RuntimeRecord = {}): RecoveryOrientation {
  const override = PROFILE_OVERRIDES[slugOf(record)]?.recoveryOrientation
  if (override) return override

  const source = corpus(record)
  if (hasAny(source, ['sleep', 'evening', 'insomnia', 'glycine', 'magnesium'])) return 'sleep-adjacent'
  if (hasAny(source, ['memory', 'focus', 'cognition', 'nootropic', 'attention'])) return 'cognition-oriented'
  if (hasAny(source, ['exercise', 'training', 'muscle', 'performance', 'energy'])) return 'performance-oriented'
  if (hasAny(source, ['stress', 'adaptogen', 'resilience', 'anxiety'])) return 'stress-modulating'
  return 'recovery-oriented'
}

export function buildDecisionVisualProfile(record: RuntimeRecord = {}): DecisionVisualProfile {
  const profile: DecisionVisualProfile = {
    stimulation: getStimulationProfile(record),
    timeline: getTimelineProfile(record),
    difficulty: getBeginnerDifficulty(record),
    stackComplexity: getStackComplexity(record),
    responderVariability: getResponderVariabilityLevel(record),
    recoveryOrientation: getRecoveryOrientation(record),
    tags: [],
  }

  profile.tags = unique([
    profile.stimulation,
    profile.timeline,
    profile.difficulty,
    profile.stackComplexity === 'simple' ? 'simple stack fit' : `${profile.stackComplexity} stack fit`,
    profile.responderVariability,
    profile.recoveryOrientation,
  ]).slice(0, 8)

  return profile
}
