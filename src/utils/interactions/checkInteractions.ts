import {
  type InteractionConfidence,
  type InteractionFinding,
  type InteractionFindingBasis,
  type InteractionReport,
  type InteractionSignalSource,
  type InteractionSeverity,
  type InteractionSourceItem,
} from '@/types/interactions'
import { extractInteractionSignals } from './extractInteractionSignals'

function hasAny(tags: Set<string>, expected: string[]): boolean {
  return expected.some(tag => tags.has(tag))
}

function pushUniqueFindings(findings: InteractionFinding[], finding: InteractionFinding) {
  const key = `${finding.title}:${finding.summary}`
  if (findings.some(item => `${item.title}:${item.summary}` === key)) return
  findings.push(finding)
}

function clampScore(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function severityToBaseScore(severity: InteractionSeverity): number {
  if (severity === 'high') return 90
  if (severity === 'moderate') return 62
  if (severity === 'low') return 38
  return 20
}

function scoreToSeverity(score: number): InteractionSeverity {
  if (score >= 75) return 'high'
  if (score >= 48) return 'moderate'
  return 'low'
}

function scoreToConfidence(score: number): InteractionConfidence {
  if (score >= 74) return 'high'
  if (score >= 46) return 'medium'
  return 'low'
}

function maxSeverity(severities: InteractionSeverity[]): InteractionSeverity {
  const rank: Record<InteractionSeverity, number> = { unknown: 0, low: 1, moderate: 2, high: 3 }
  return severities.reduce(
    (current, next) => (rank[next] > rank[current] ? next : current),
    'unknown'
  )
}

function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractMechanismPhrases(item: InteractionSourceItem): string[] {
  const source = `${item.mechanism ?? ''} | ${(item.interactionNotes ?? []).join(' | ')}`
  if (!source.trim()) return []

  return source
    .split(/[.;,|]/)
    .map(entry => normalizePhrase(entry))
    .filter(entry => entry.length >= 4)
}

function getSharedTagCount(matchedItems: ReturnType<typeof extractInteractionSignals>[]): number {
  if (matchedItems.length < 2) return 0
  const tagCounts = new Map<string, number>()
  matchedItems.forEach(item => {
    item.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    })
  })

  return Array.from(tagCounts.values()).filter(count => count >= 2).length
}

function getOverlappingMechanisms(
  matchedItems: ReturnType<typeof extractInteractionSignals>[]
): string[] {
  if (matchedItems.length < 2) return []

  const mechanismCounts = new Map<string, number>()
  matchedItems.forEach(item => {
    const uniquePhrases = new Set(extractMechanismPhrases(item.item))
    uniquePhrases.forEach(phrase => {
      mechanismCounts.set(phrase, (mechanismCounts.get(phrase) ?? 0) + 1)
    })
  })

  return Array.from(mechanismCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([phrase]) => phrase)
    .slice(0, 3)
}

function resolveFindingBasisAndConfidence(
  matchedItems: ReturnType<typeof extractInteractionSignals>[],
  signalTags: string[]
): { basis: InteractionFindingBasis; sourceConfidence: InteractionConfidence } {
  const usedSources = new Set<InteractionSignalSource>()

  matchedItems.forEach(item => {
    signalTags.forEach(tag => {
      const source = item.sourceByTag.get(tag)
      if (source) usedSources.add(source)
    })
  })

  const hasStructured = usedSources.has('structured')
  const hasInferred = usedSources.has('inferred')

  if (hasStructured && hasInferred) return { basis: 'mixed', sourceConfidence: 'medium' }
  if (hasStructured) return { basis: 'structured', sourceConfidence: 'high' }
  return { basis: 'inferred', sourceConfidence: 'low' }
}

function collectEvidence(
  matchedItems: ReturnType<typeof extractInteractionSignals>[],
  signalTags: string[]
): string[] {
  return matchedItems.flatMap(item =>
    signalTags.flatMap(tag => {
      const basis = item.evidenceByTag.get(tag)
      if (!basis?.length) return []
      return basis.map(entry => `${item.item.name}: ${entry}`)
    })
  )
}

function toDisplayMechanismLabel(phrase: string): string {
  return phrase.replace(/\b\w/g, char => char.toUpperCase())
}

function buildFindingExplanation(
  signalLabel: string,
  sharedTags: number,
  overlappingMechanisms: string[]
): string {
  const mechanismClause = overlappingMechanisms.length
    ? ` They also share mechanism clues (${overlappingMechanisms
        .map(toDisplayMechanismLabel)
        .join(', ')}), which supports this signal.`
    : ''

  const sharedTagClause =
    sharedTags > 1
      ? ` Multiple aligned interaction tags (${sharedTags}) point in the same direction.`
      : sharedTags === 1
        ? ' One aligned interaction tag appears across the selected items.'
        : ''

  return `${signalLabel}${sharedTagClause}${mechanismClause}`
}

function createScoredFinding({
  title,
  summary,
  baseSeverity,
  signalLabel,
  matchedItems,
  signalTags,
  evidenceBasis,
}: {
  title: string
  summary: string
  baseSeverity: InteractionSeverity
  signalLabel: string
  matchedItems: ReturnType<typeof extractInteractionSignals>[]
  signalTags: string[]
  evidenceBasis: string[]
}): InteractionFinding {
  const { basis, sourceConfidence } = resolveFindingBasisAndConfidence(matchedItems, signalTags)
  const sharedTagCount = getSharedTagCount(matchedItems)
  const overlappingMechanisms = getOverlappingMechanisms(matchedItems)
  const overlappingMechanismCount = overlappingMechanisms.length

  const weightedScore = clampScore(
    severityToBaseScore(baseSeverity) +
      sharedTagCount * 6 +
      overlappingMechanismCount * 8 +
      (sourceConfidence === 'high' ? 6 : sourceConfidence === 'medium' ? 2 : -6)
  )

  return {
    title,
    severity: scoreToSeverity(weightedScore),
    confidence: scoreToConfidence(weightedScore),
    confidenceScore: weightedScore,
    basis,
    summary,
    explanation: buildFindingExplanation(signalLabel, sharedTagCount, overlappingMechanisms),
    sharedTagCount,
    overlappingMechanismCount,
    overlappingMechanisms,
    evidenceBasis,
  }
}

function buildReportSummary(reportFindings: InteractionFinding[], dataLimited: boolean): string {
  if (reportFindings.length === 0) {
    return dataLimited
      ? 'No clear overlap signal was detected, but missing structured fields limit confidence.'
      : 'No strong structured overlap signals were detected for this combination.'
  }

  const highCount = reportFindings.filter(finding => finding.severity === 'high').length
  const moderateCount = reportFindings.filter(finding => finding.severity === 'moderate').length

  if (highCount > 0) {
    return `${highCount} high-priority interaction signal(s) were detected. Use conservative timing and avoid stacking similar effects.`
  }
  if (moderateCount > 0) {
    return `${moderateCount} moderate interaction signal(s) were detected. Consider dose spacing and avoid rapid dose escalation.`
  }
  return 'Only low-strength overlap signals were detected, but caution is still appropriate when combining items.'
}

export function checkInteractions(items: InteractionSourceItem[]): InteractionReport {
  const selected = items.slice(0, 3)
  const extracted = selected.map(extractInteractionSignals)
  const findings: InteractionFinding[] = []

  const sedativeItems = extracted.filter(({ tags }) =>
    hasAny(tags, ['sedative', 'cns-depressant', 'gabaergic'])
  )
  if (sedativeItems.length >= 2) {
    pushUniqueFindings(
      findings,
      createScoredFinding({
        title: 'Sedative overlap signal',
        baseSeverity: sedativeItems.length >= 3 ? 'moderate' : 'low',
        signalLabel:
          'These items all point toward calming/CNS-depressant effects, which can compound sedation and slow reaction time.',
        summary:
          'More than one selected item has calming or sedating signals. Taking them together may increase drowsiness, slowed reaction time, or next-day grogginess.',
        matchedItems: sedativeItems,
        signalTags: ['sedative', 'cns-depressant', 'gabaergic'],
        evidenceBasis: collectEvidence(sedativeItems, ['sedative', 'cns-depressant', 'gabaergic']),
      })
    )
  }

  const stimulantItems = extracted.filter(({ tags }) => tags.has('stimulant'))
  if (stimulantItems.length >= 2) {
    pushUniqueFindings(
      findings,
      createScoredFinding({
        title: 'Stimulant overlap signal',
        baseSeverity: stimulantItems.length >= 3 ? 'moderate' : 'low',
        signalLabel:
          'These compounds and herbs both increase activating signals, which can add up to overstimulation.',
        summary:
          'More than one selected item has stimulating signals. Combining them may raise the chance of jitters, anxiety, faster heart rate, or trouble sleeping.',
        matchedItems: stimulantItems,
        signalTags: ['stimulant'],
        evidenceBasis: collectEvidence(stimulantItems, ['stimulant']),
      })
    )
  }

  const serotonergicItems = extracted.filter(({ tags }) => tags.has('serotonergic'))
  if (serotonergicItems.length >= 2) {
    pushUniqueFindings(
      findings,
      createScoredFinding({
        title: 'Serotonergic overlap signal',
        baseSeverity: 'moderate',
        signalLabel:
          'These compounds both increase serotonergic activity, which may raise risk of serotonin-related side effects.',
        summary:
          'Multiple selected items show serotonin-related activity. The combination deserves extra caution, especially with conservative dosing and timing.',
        matchedItems: serotonergicItems,
        signalTags: ['serotonergic'],
        evidenceBasis: collectEvidence(serotonergicItems, ['serotonergic']),
      })
    )
  }

  const maoItems = extracted.filter(({ tags }) => tags.has('maoi'))
  if (maoItems.length >= 1 && (serotonergicItems.length >= 1 || stimulantItems.length >= 1)) {
    const baseSeverity: InteractionSeverity =
      maoItems.length >= 1 && serotonergicItems.length >= 1 && stimulantItems.length >= 1
        ? 'high'
        : 'moderate'
    const mergedItems = [...new Set([...maoItems, ...serotonergicItems, ...stimulantItems])]
    pushUniqueFindings(
      findings,
      createScoredFinding({
        title: 'MAOI combination caution',
        baseSeverity,
        signalLabel:
          'MAOI-related activity can intensify serotonergic or stimulant pathways, which raises interaction complexity.',
        summary:
          'An MAO-related signal appears with serotonin-related or stimulant signals. That pattern can increase interaction concern, so a conservative approach is important.',
        matchedItems: mergedItems,
        signalTags: ['maoi', 'serotonergic', 'stimulant'],
        evidenceBasis: [
          ...collectEvidence(maoItems, ['maoi']),
          ...collectEvidence(serotonergicItems, ['serotonergic']),
          ...collectEvidence(stimulantItems, ['stimulant']),
        ],
      })
    )
  }

  const cardioItems = extracted.filter(({ tags }) => hasAny(tags, ['cardioactive', 'stimulant']))
  if (cardioItems.length >= 2) {
    pushUniqueFindings(
      findings,
      createScoredFinding({
        title: 'Cardiovascular caution overlap',
        baseSeverity: cardioItems.length >= 3 ? 'moderate' : 'low',
        signalLabel:
          'These items share cardiovascular or activating tags that can combine into higher pulse/blood-pressure load.',
        summary:
          'Selected items share heart or stimulant-related caution signals. Together they may add strain on heart rate or blood pressure.',
        matchedItems: cardioItems,
        signalTags: ['cardioactive', 'stimulant'],
        evidenceBasis: collectEvidence(cardioItems, ['cardioactive', 'stimulant']),
      })
    )
  }

  const hepaticItems = extracted.filter(({ tags }) => tags.has('hepatotoxic'))
  if (hepaticItems.length >= 2) {
    pushUniqueFindings(
      findings,
      createScoredFinding({
        title: 'Liver burden overlap signal',
        baseSeverity: hepaticItems.length >= 3 ? 'moderate' : 'low',
        signalLabel:
          'Shared liver-stress tags suggest cumulative metabolic burden may be higher when these are combined.',
        summary:
          'More than one selected item includes liver-related caution signals. Using them together may increase overall liver burden.',
        matchedItems: hepaticItems,
        signalTags: ['hepatotoxic'],
        evidenceBasis: collectEvidence(hepaticItems, ['hepatotoxic']),
      })
    )
  }

  const sparseDataItems = extracted.filter(item => item.dataCoverageScore <= 1)
  const dataLimited = sparseDataItems.length > 0

  if (dataLimited) {
    findings.push({
      title: 'Sparse data warning',
      severity: 'low',
      confidence: 'low',
      confidenceScore: 24,
      basis: 'inferred',
      summary:
        'At least one selected item has limited structured mechanism or safety data, so this report has lower reliability and may miss signals.',
      explanation:
        'The dataset for one or more selected items is thin, so absence of signals should not be treated as absence of risk.',
      sharedTagCount: 0,
      overlappingMechanismCount: 0,
      overlappingMechanisms: [],
      evidenceBasis: sparseDataItems.map(item => `${item.item.name}: limited structured fields`),
    })
  }

  const primaryFindings = findings.filter(finding => finding.title !== 'Sparse data warning')
  const overallSeverity = maxSeverity(primaryFindings.map(item => item.severity))
  const weightedAverage = primaryFindings.length
    ? clampScore(
        primaryFindings.reduce((sum, finding) => sum + finding.confidenceScore, 0) /
          primaryFindings.length -
          (dataLimited ? 12 : 0)
      )
    : clampScore(dataLimited ? 30 : 50)
  const overallConfidence = scoreToConfidence(weightedAverage)

  const keySignals = primaryFindings.map(
    finding =>
      `${finding.title} — ${finding.severity} severity (${finding.confidenceScore}/100 confidence score)`
  )
  const notes = [
    'This tool highlights overlap patterns for harm reduction planning; it is not medical advice.',
    'These results are caution signals, not proof that a specific adverse outcome will occur.',
    'If you choose to combine items, consider lower starting amounts and wider spacing to reduce risk.',
  ]

  if (dataLimited) {
    notes.push('Some selected entries have limited safety data, so this report may be incomplete.')
  }

  return {
    items: selected.map(item => item.name),
    findings,
    summary: buildReportSummary(primaryFindings, dataLimited),
    keySignals,
    overallSeverity,
    overallConfidence,
    overallConfidenceScore: weightedAverage,
    dataLimited,
    notes,
  }
}
