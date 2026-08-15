export type OutcomeDomain = 'sleep' | 'anxiety' | 'stress' | 'cognition'

export type CanonicalOutcomeId =
  | 'sleep-quality'
  | 'anxiety-severity'
  | 'stress-severity'
  | 'cognition-memory'
  | 'cognition-other'

export type OutcomeInstrumentId =
  | 'PSQI'
  | 'HAM-A'
  | 'GAD-7'
  | 'PSS'
  | 'MEMORY-OBJECTIVE'
  | 'MEMORY-SUBJECTIVE'
  | 'OTHER'

export type OutcomeOntologyNode = {
  id: CanonicalOutcomeId | OutcomeDomain
  label: string
  parentId?: OutcomeDomain
  aliases?: string[]
}

export const OUTCOME_ONTOLOGY: OutcomeOntologyNode[] = [
  { id: 'sleep', label: 'Sleep' },
  {
    id: 'sleep-quality',
    label: 'Sleep quality',
    parentId: 'sleep',
    aliases: ['sleep quality', 'subjective sleep quality', 'perceived sleep quality'],
  },
  { id: 'anxiety', label: 'Anxiety' },
  {
    id: 'anxiety-severity',
    label: 'Anxiety severity',
    parentId: 'anxiety',
    aliases: ['anxiety symptoms', 'anxiety severity', 'generalized anxiety symptoms'],
  },
  { id: 'stress', label: 'Stress' },
  {
    id: 'stress-severity',
    label: 'Stress severity',
    parentId: 'stress',
    aliases: ['perceived stress', 'stress symptoms', 'stress score'],
  },
  { id: 'cognition', label: 'Cognition' },
  {
    id: 'cognition-memory',
    label: 'Memory',
    parentId: 'cognition',
    aliases: ['memory', 'recall', 'recognition memory', 'memory performance'],
  },
  {
    id: 'cognition-other',
    label: 'Other cognition domain',
    parentId: 'cognition',
    aliases: ['cognition', 'cognitive performance', 'cognitive function'],
  },
]

export type InstrumentDefinition = {
  id: OutcomeInstrumentId
  label: string
  canonicalOutcomeId: CanonicalOutcomeId
  subjective: boolean
}

export const OUTCOME_INSTRUMENTS: InstrumentDefinition[] = [
  { id: 'PSQI', label: 'Pittsburgh Sleep Quality Index', canonicalOutcomeId: 'sleep-quality', subjective: true },
  { id: 'HAM-A', label: 'Hamilton Anxiety Rating Scale', canonicalOutcomeId: 'anxiety-severity', subjective: false },
  { id: 'GAD-7', label: 'Generalized Anxiety Disorder 7-item scale', canonicalOutcomeId: 'anxiety-severity', subjective: true },
  { id: 'PSS', label: 'Perceived Stress Scale', canonicalOutcomeId: 'stress-severity', subjective: true },
  { id: 'MEMORY-OBJECTIVE', label: 'Objective memory test', canonicalOutcomeId: 'cognition-memory', subjective: false },
  { id: 'MEMORY-SUBJECTIVE', label: 'Subjective memory symptoms', canonicalOutcomeId: 'cognition-memory', subjective: true },
  { id: 'OTHER', label: 'Other or unclassified instrument', canonicalOutcomeId: 'cognition-other', subjective: false },
]

export type NormalizedOutcome = {
  rawOutcome: string
  canonicalOutcomeId: CanonicalOutcomeId | null
  domain: OutcomeDomain | null
  instrumentId: OutcomeInstrumentId | null
  normalizationConfidence: 'high' | 'moderate' | 'low'
  requiresManualReview: boolean
}

const INSTRUMENT_PATTERNS: Array<{ re: RegExp; id: OutcomeInstrumentId }> = [
  { re: /\b(?:PSQI|Pittsburgh Sleep Quality Index)\b/i, id: 'PSQI' },
  { re: /\b(?:HAM[- ]?A|Hamilton Anxiety Rating Scale)\b/i, id: 'HAM-A' },
  { re: /\b(?:GAD[- ]?7|Generalized Anxiety Disorder 7)\b/i, id: 'GAD-7' },
  { re: /\b(?:PSS|Perceived Stress Scale)\b/i, id: 'PSS' },
]

function definitionForInstrument(id: OutcomeInstrumentId) {
  return OUTCOME_INSTRUMENTS.find((instrument) => instrument.id === id)
}

function ontologyNodeForAlias(value: string) {
  const normalized = value.trim().toLowerCase()
  return OUTCOME_ONTOLOGY.find((node) => node.aliases?.some((alias) => alias === normalized))
}

export function normalizeOutcome(rawOutcome: string, instrumentHint?: string): NormalizedOutcome {
  const instrumentText = `${rawOutcome} ${instrumentHint ?? ''}`
  const matchedInstrument = INSTRUMENT_PATTERNS.find(({ re }) => re.test(instrumentText))?.id ?? null
  const instrumentDefinition = matchedInstrument ? definitionForInstrument(matchedInstrument) : null

  if (instrumentDefinition) {
    const ontology = OUTCOME_ONTOLOGY.find((node) => node.id === instrumentDefinition.canonicalOutcomeId)
    return {
      rawOutcome,
      canonicalOutcomeId: instrumentDefinition.canonicalOutcomeId,
      domain: ontology?.parentId ?? null,
      instrumentId: matchedInstrument,
      normalizationConfidence: 'high',
      requiresManualReview: false,
    }
  }

  const aliasNode = ontologyNodeForAlias(rawOutcome)
  if (aliasNode?.parentId) {
    return {
      rawOutcome,
      canonicalOutcomeId: aliasNode.id as CanonicalOutcomeId,
      domain: aliasNode.parentId,
      instrumentId: null,
      normalizationConfidence: rawOutcome.trim().toLowerCase() === 'subjective sleep quality' ? 'moderate' : 'high',
      requiresManualReview: rawOutcome.trim().toLowerCase() === 'subjective sleep quality',
    }
  }

  if (/\bmemory\b|\brecall\b|\brecognition\b/i.test(rawOutcome)) {
    const subjective = /\bsubjective|self[- ]report|perceived\b/i.test(rawOutcome)
    return {
      rawOutcome,
      canonicalOutcomeId: 'cognition-memory',
      domain: 'cognition',
      instrumentId: subjective ? 'MEMORY-SUBJECTIVE' : 'MEMORY-OBJECTIVE',
      normalizationConfidence: 'moderate',
      requiresManualReview: true,
    }
  }

  if (/\bcogniti(?:on|ve)\b/i.test(rawOutcome)) {
    return {
      rawOutcome,
      canonicalOutcomeId: 'cognition-other',
      domain: 'cognition',
      instrumentId: null,
      normalizationConfidence: 'low',
      requiresManualReview: true,
    }
  }

  return {
    rawOutcome,
    canonicalOutcomeId: null,
    domain: null,
    instrumentId: null,
    normalizationConfidence: 'low',
    requiresManualReview: true,
  }
}

export type OutcomeObservation = {
  studyId: string
  independentUnitId: string
  rawOutcome: string
  instrument?: string
  direction: 'positive' | 'null' | 'negative' | 'mixed'
  effectSize?: number
  participantCount?: number
}

export type OutcomeSynthesisGroup = {
  canonicalOutcomeId: CanonicalOutcomeId
  instrumentId: OutcomeInstrumentId | null
  studyCount: number
  independentTrialCount: number
  participantCount: number
  directions: Record<'positive' | 'null' | 'negative' | 'mixed', number>
  observations: Array<OutcomeObservation & { normalized: NormalizedOutcome }>
  requiresManualReview: boolean
}

export function buildOutcomeSynthesis(observations: OutcomeObservation[]): OutcomeSynthesisGroup[] {
  const groups = new Map<string, OutcomeSynthesisGroup>()

  for (const observation of observations) {
    const normalized = normalizeOutcome(observation.rawOutcome, observation.instrument)
    if (!normalized.canonicalOutcomeId) continue

    // Preserve instrument identity when it is known. This lets PSQI, HAM-A,
    // GAD-7, PSS, and memory measures share a parent outcome without being
    // merged into one undifferentiated score.
    const key = `${normalized.canonicalOutcomeId}:${normalized.instrumentId ?? 'unspecified'}`
    const existing = groups.get(key) ?? {
      canonicalOutcomeId: normalized.canonicalOutcomeId,
      instrumentId: normalized.instrumentId,
      studyCount: 0,
      independentTrialCount: 0,
      participantCount: 0,
      directions: { positive: 0, null: 0, negative: 0, mixed: 0 },
      observations: [],
      requiresManualReview: false,
    }

    existing.studyCount += 1
    existing.participantCount += observation.participantCount ?? 0
    existing.directions[observation.direction] += 1
    existing.observations.push({ ...observation, normalized })
    existing.requiresManualReview = existing.requiresManualReview || normalized.requiresManualReview
    groups.set(key, existing)
  }

  for (const group of groups.values()) {
    group.independentTrialCount = new Set(group.observations.map((observation) => observation.independentUnitId)).size
  }

  return [...groups.values()].sort((left, right) => {
    const outcomeCompare = left.canonicalOutcomeId.localeCompare(right.canonicalOutcomeId)
    if (outcomeCompare !== 0) return outcomeCompare
    return String(left.instrumentId).localeCompare(String(right.instrumentId))
  })
}

export function outcomeParent(outcomeId: CanonicalOutcomeId): OutcomeDomain {
  return OUTCOME_ONTOLOGY.find((node) => node.id === outcomeId)?.parentId ?? 'cognition'
}

export function listOutcomeChildren(domain: OutcomeDomain) {
  return OUTCOME_ONTOLOGY.filter((node) => node.parentId === domain)
}
