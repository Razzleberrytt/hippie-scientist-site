#!/usr/bin/env node

const CLASS_WEIGHT = {
  'human-clinical': 5,
  'human-observational': 4,
  'regulatory-monograph': 3,
  'preclinical-mechanistic': 2,
  'traditional-use': 1,
}

const DESIGN_WEIGHT = {
  'randomized-human-trial': 5,
  'systematic-review-meta-analysis': 5,
  'non-randomized-human-study': 4,
  'observational-human-evidence': 3,
  'regulatory-agency-monograph-guidance': 3,
  'reference-database-authority': 3,
  'preclinical-mechanistic-study': 2,
  'traditional-use-monograph': 1,
}

const RELIABILITY_WEIGHT = {
  'tier-a': 4,
  'tier-b': 3,
  'tier-c': 2,
  'tier-d': 1,
}

const HUMAN_CLASSES = new Set(['human-clinical', 'human-observational'])

function toStrengthWeight(value) {
  if (value === 'strong') return 3
  if (value === 'moderate') return 2
  if (value === 'limited') return 1
  return 0
}

function toRecencyWeight(year) {
  if (!Number.isFinite(year)) return 1
  if (year >= 2020) return 2
  if (year >= 2010) return 1
  return 0
}

function hasUncertainty(entry) {
  return typeof entry.uncertaintyNote === 'string' && entry.uncertaintyNote.trim().length > 0
}

function hasContradictoryClaimType(entries) {
  const supported = entries.some(entry => entry.topicType === 'supported_use' && entry.claimType === 'efficacy_signal')
  const unsupported = entries.some(
    entry =>
      entry.topicType === 'unsupported_or_unclear_use' ||
      entry.claimType === 'efficacy_null_or_mixed' ||
      entry.topicType === 'conflict_note',
  )
  return supported && unsupported
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size
}

function conflictStateFromSignals(signals) {
  const {
    hasHumanConflict,
    hasMonographConflict,
    humanAgainstPreclinical,
    hasExplicitConflictNote,
    hasMixedSignal,
  } = signals

  if (hasHumanConflict || hasMonographConflict) return 'conflicting_evidence'
  if (humanAgainstPreclinical || hasExplicitConflictNote || hasMixedSignal) return 'mixed_or_uncertain'
  return 'none'
}

function determineEvidenceLabel(metrics) {
  if (metrics.totalEntries === 0) return 'insufficient_evidence'

  if (metrics.conflictState === 'conflicting_evidence') return 'conflicting_evidence'
  if (metrics.conflictState === 'mixed_or_uncertain') return 'mixed_or_uncertain'

  if (metrics.humanClinicalCount > 0) {
    if (metrics.supportedHumanSignals >= 2 && metrics.replicationDepth >= 2 && metrics.confidenceIndex >= 12) {
      return 'stronger_human_support'
    }
    return 'limited_human_support'
  }

  if (metrics.humanObservationalCount > 0) return 'observational_only'
  if (metrics.preclinicalCount > 0) return 'preclinical_only'
  if (metrics.traditionalCount > 0 && metrics.humanTotalCount === 0 && metrics.preclinicalCount === 0) {
    return 'traditional_use_only'
  }

  return 'insufficient_evidence'
}

function toneGuidanceFromLabel(label) {
  if (label === 'stronger_human_support') return 'Use measured efficacy language with population and context qualifiers.'
  if (label === 'limited_human_support') return 'Describe as preliminary human evidence and avoid definitive efficacy claims.'
  if (label === 'observational_only') return 'Frame as association-level evidence; avoid causal language.'
  if (label === 'preclinical_only') return 'Keep claims mechanistic or hypothesis-level; avoid human-benefit framing.'
  if (label === 'traditional_use_only') return 'Present as traditional-use context and explicitly note modern evidence gaps.'
  if (label === 'conflicting_evidence') return 'Lead with disagreement across sources and avoid directional conclusions.'
  if (label === 'mixed_or_uncertain') return 'Use uncertainty-forward copy and clarify where findings diverge.'
  return 'State that evidence is insufficient and avoid efficacy implications.'
}

export function gradeEvidenceEntries(entries, sourceById, options = {}) {
  const nowYear = Number.isFinite(options.nowYear) ? options.nowYear : new Date().getUTCFullYear()
  const totalEntries = entries.length
  const metrics = {
    totalEntries,
    humanClinicalCount: 0,
    humanObservationalCount: 0,
    humanTotalCount: 0,
    preclinicalCount: 0,
    traditionalCount: 0,
    regulatoryCount: 0,
    supportedHumanSignals: 0,
    unsupportedHumanSignals: 0,
    sourceReliabilityTierMax: 'tier-d',
    studyDesignWeightMax: 0,
    evidenceClassWeightMax: 0,
    recencyWeightMax: 0,
    replicationDepth: 0,
    editorialConfidence: 'low',
    directnessToClaim: 'indirect',
    humanRelevance: 'none',
    conflictState: 'none',
    confidenceIndex: 0,
  }

  const reliabilityValues = []
  const sourceIds = new Set()
  const sourceClasses = []
  const unresolved = []

  for (const entry of entries) {
    const source = sourceById.get(entry.sourceId)
    if (!source) {
      unresolved.push(entry.sourceId)
      continue
    }

    sourceIds.add(entry.sourceId)
    sourceClasses.push(source.sourceClass)
    reliabilityValues.push(source.reliabilityTier)

    const evidenceWeight = CLASS_WEIGHT[entry.evidenceClass] ?? 0
    metrics.evidenceClassWeightMax = Math.max(metrics.evidenceClassWeightMax, evidenceWeight)

    const designWeight = DESIGN_WEIGHT[source.sourceClass] ?? 0
    metrics.studyDesignWeightMax = Math.max(metrics.studyDesignWeightMax, designWeight)

    const publicationYear = Number(source.publicationYear)
    const recencyWeight = toRecencyWeight(publicationYear > nowYear ? nowYear : publicationYear)
    metrics.recencyWeightMax = Math.max(metrics.recencyWeightMax, recencyWeight)

    if (entry.evidenceClass === 'human-clinical') metrics.humanClinicalCount += 1
    if (entry.evidenceClass === 'human-observational') metrics.humanObservationalCount += 1
    if (entry.evidenceClass === 'preclinical-mechanistic') metrics.preclinicalCount += 1
    if (entry.evidenceClass === 'traditional-use') metrics.traditionalCount += 1
    if (entry.evidenceClass === 'regulatory-monograph') metrics.regulatoryCount += 1

    if (HUMAN_CLASSES.has(entry.evidenceClass) && entry.topicType === 'supported_use') metrics.supportedHumanSignals += 1
    if (
      HUMAN_CLASSES.has(entry.evidenceClass) &&
      (entry.topicType === 'unsupported_or_unclear_use' || entry.claimType === 'efficacy_null_or_mixed')
    ) {
      metrics.unsupportedHumanSignals += 1
    }
  }

  metrics.humanTotalCount = metrics.humanClinicalCount + metrics.humanObservationalCount
  metrics.replicationDepth = sourceIds.size

  const reliabilityMax = Math.max(...reliabilityValues.map(value => RELIABILITY_WEIGHT[value] ?? 0), 0)
  const reliabilityTier =
    Object.entries(RELIABILITY_WEIGHT).find(([, value]) => value === reliabilityMax)?.[0] ?? 'tier-d'

  metrics.sourceReliabilityTierMax = reliabilityTier

  const hasHumanConflict = metrics.supportedHumanSignals > 0 && metrics.unsupportedHumanSignals > 0
  const hasMonographConflict = uniqueCount(
    entries
      .filter(entry => entry.evidenceClass === 'regulatory-monograph')
      .map(entry => entry.claimType),
  ) > 1

  const hasExplicitConflictNote = entries.some(entry => entry.topicType === 'conflict_note' || entry.claimType === 'evidence_conflict')
  const humanAgainstPreclinical =
    metrics.preclinicalCount > 0 &&
    entries.some(entry => entry.evidenceClass === 'preclinical-mechanistic' && entry.topicType === 'supported_use') &&
    entries.some(
      entry => entry.evidenceClass === 'human-clinical' && (entry.topicType === 'unsupported_or_unclear_use' || entry.claimType === 'efficacy_null_or_mixed'),
    )
  const hasMixedSignal = entries.some(hasUncertainty) || hasContradictoryClaimType(entries)

  metrics.conflictState = conflictStateFromSignals({
    hasHumanConflict,
    hasMonographConflict,
    humanAgainstPreclinical,
    hasExplicitConflictNote,
    hasMixedSignal,
  })

  if (metrics.humanClinicalCount > 0) {
    metrics.humanRelevance = 'direct-human'
    metrics.directnessToClaim = 'direct'
  } else if (metrics.humanObservationalCount > 0) {
    metrics.humanRelevance = 'human-observational'
    metrics.directnessToClaim = 'proximal'
  } else if (metrics.preclinicalCount > 0) {
    metrics.humanRelevance = 'preclinical-proxy'
    metrics.directnessToClaim = 'indirect'
  } else if (metrics.traditionalCount > 0) {
    metrics.humanRelevance = 'traditional-context'
    metrics.directnessToClaim = 'contextual'
  }

  const confidenceIndex =
    metrics.evidenceClassWeightMax +
    metrics.studyDesignWeightMax +
    reliabilityMax +
    Math.min(metrics.replicationDepth, 3) +
    metrics.recencyWeightMax -
    (metrics.conflictState === 'conflicting_evidence' ? 4 : metrics.conflictState === 'mixed_or_uncertain' ? 2 : 0)

  metrics.confidenceIndex = Math.max(confidenceIndex, 0)

  if (metrics.confidenceIndex >= 13 && metrics.conflictState === 'none') metrics.editorialConfidence = 'high'
  else if (metrics.confidenceIndex >= 8) metrics.editorialConfidence = 'medium'
  else metrics.editorialConfidence = 'low'

  const evidenceLabel = determineEvidenceLabel(metrics)

  const conflictNotes = []
  if (hasHumanConflict) {
    conflictNotes.push('Human evidence includes both efficacy-supporting and null/mixed findings.')
  }
  if (hasMonographConflict) {
    conflictNotes.push('Regulatory or monograph guidance is directionally mixed across cited sources.')
  }
  if (humanAgainstPreclinical) {
    conflictNotes.push('Preclinical enthusiasm is not aligned with available human finding direction.')
  }
  if (hasExplicitConflictNote) {
    conflictNotes.push('Source-backed conflict notes are present for this topic.')
  }

  const uncertaintyNotes = []
  if (entries.some(hasUncertainty)) {
    uncertaintyNotes.push('One or more findings carry explicit uncertainty notes from editorial review.')
  }
  if (metrics.replicationDepth <= 1 && totalEntries > 0) {
    uncertaintyNotes.push('Evidence is sourced from a single source record; replication depth is limited.')
  }
  if (metrics.humanTotalCount === 0 && (metrics.preclinicalCount > 0 || metrics.traditionalCount > 0)) {
    uncertaintyNotes.push('No direct human evidence was identified for this topic.')
  }
  if (unresolved.length > 0) {
    uncertaintyNotes.push(`Missing source registry records for sourceIds: ${Array.from(new Set(unresolved)).join(', ')}.`)
  }

  return {
    evidenceLabel,
    grading: {
      evidenceClass: Array.from(new Set(entries.map(entry => entry.evidenceClass))).sort(),
      studyDesignWeight: metrics.studyDesignWeightMax,
      humanRelevance: metrics.humanRelevance,
      directnessToClaim: metrics.directnessToClaim,
      replicationDepth: metrics.replicationDepth,
      sourceReliabilityTier: metrics.sourceReliabilityTierMax,
      recencyWeight: metrics.recencyWeightMax,
      editorialConfidence: metrics.editorialConfidence,
      conflictState: metrics.conflictState,
      confidenceIndex: metrics.confidenceIndex,
    },
    conflictNotes,
    uncertaintyNotes,
    toneGuidance: toneGuidanceFromLabel(evidenceLabel),
  }
}

export function gradeEvidenceByTopic(entries, sourceById, options = {}) {
  const topics = new Map()
  for (const entry of entries) {
    if (!topics.has(entry.topicType)) topics.set(entry.topicType, [])
    topics.get(entry.topicType).push(entry)
  }

  return Object.fromEntries(
    Array.from(topics.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([topicType, topicEntries]) => [topicType, gradeEvidenceEntries(topicEntries, sourceById, options)]),
  )
}

export function summarizeEvidenceRollup(rollupRows) {
  const byLabel = {}
  const byEntityTopic = {}
  const conflictCases = []
  const downgradedTopics = []

  for (const row of rollupRows) {
    const entityKey = `${row.entityType}:${row.entitySlug}`
    const topicJudgments = row.researchEnrichment.topicEvidenceJudgments ?? {}

    for (const [topicType, topic] of Object.entries(topicJudgments)) {
      const label = topic?.evidenceLabel ?? 'insufficient_evidence'
      byLabel[label] = (byLabel[label] ?? 0) + 1

      if (!byEntityTopic[entityKey]) byEntityTopic[entityKey] = {}
      byEntityTopic[entityKey][topicType] = label

      if (topic?.grading?.conflictState && topic.grading.conflictState !== 'none') {
        conflictCases.push({
          entityType: row.entityType,
          entitySlug: row.entitySlug,
          topicType,
          conflictState: topic.grading.conflictState,
          conflictNotes: topic.conflictNotes ?? [],
        })
      }

      if (['preclinical_only', 'traditional_use_only', 'mixed_or_uncertain', 'conflicting_evidence', 'insufficient_evidence'].includes(label)) {
        downgradedTopics.push({
          entityType: row.entityType,
          entitySlug: row.entitySlug,
          topicType,
          evidenceLabel: label,
          reason: topic.toneGuidance,
        })
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalEntities: rollupRows.length,
    evidenceLabelCounts: byLabel,
    byEntityTopic,
    conflictCases,
    downgradedTopics,
  }
}

export function validateJudgmentConsistency(judgment) {
  const issues = []
  const classes = new Set(judgment?.grading?.evidenceClass ?? [])
  const label = judgment?.evidenceLabel

  if (label === 'stronger_human_support' && !classes.has('human-clinical')) {
    issues.push('stronger_human_support requires human-clinical evidenceClass.')
  }
  if (label === 'observational_only' && (classes.has('human-clinical') || classes.size !== 1 || !classes.has('human-observational'))) {
    issues.push('observational_only must only include human-observational evidenceClass.')
  }
  if (label === 'preclinical_only' && (classes.size !== 1 || !classes.has('preclinical-mechanistic'))) {
    issues.push('preclinical_only must only include preclinical-mechanistic evidenceClass.')
  }
  if (label === 'traditional_use_only' && (classes.size !== 1 || !classes.has('traditional-use'))) {
    issues.push('traditional_use_only must only include traditional-use evidenceClass.')
  }
  if (label === 'conflicting_evidence' && judgment?.grading?.conflictState !== 'conflicting_evidence') {
    issues.push('conflicting_evidence label requires conflictState=conflicting_evidence.')
  }

  return issues
}
