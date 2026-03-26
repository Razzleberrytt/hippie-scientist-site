import {
  type InteractionConfidence,
  type InteractionFinding,
  type InteractionFindingBasis,
  type InteractionReport,
  type InteractionSignalSource,
  type InteractionSeverity,
  type InteractionSourceItem,
  type InteractionVerdict,
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
  if (severity === 'high') return 70
  if (severity === 'moderate') return 52
  if (severity === 'low') return 34
  return 20
}

function scoreToSeverity(score: number): InteractionSeverity {
  if (score >= 74) return 'high'
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

function normalizeList(values: string[] | undefined): string[] {
  if (!values?.length) return []
  return values.map(value => normalizePhrase(value)).filter(Boolean)
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

type InteractionPattern = {
  id: string
  tags: string[]
}

const KNOWN_INTERACTION_PATTERNS: InteractionPattern[] = [
  { id: 'sedative-cns', tags: ['sedative', 'cns-depressant'] },
  { id: 'sedative-gabaergic', tags: ['sedative', 'gabaergic'] },
  { id: 'stimulant-cardioactive', tags: ['stimulant', 'cardioactive'] },
  { id: 'maoi-serotonergic', tags: ['maoi', 'serotonergic'] },
  { id: 'maoi-stimulant', tags: ['maoi', 'stimulant'] },
  { id: 'serotonergic-psychedelic', tags: ['serotonergic', 'psychedelic'] },
  { id: 'hepatotoxic-sedative', tags: ['hepatotoxic', 'sedative'] },
]

function getKnownPatternCount(
  matchedItems: ReturnType<typeof extractInteractionSignals>[],
  signalTags: string[]
): number {
  const availableTags = new Set<string>()
  matchedItems.forEach(item => {
    item.tags.forEach(tag => {
      if (signalTags.includes(tag)) availableTags.add(tag)
    })
  })

  return KNOWN_INTERACTION_PATTERNS.filter(pattern =>
    pattern.tags.every(tag => availableTags.has(tag))
  ).length
}

function tokenize(value: string): Set<string> {
  return new Set(
    normalizePhrase(value)
      .split(' ')
      .map(part => part.trim())
      .filter(part => part.length >= 4)
  )
}

function getCompoundSimilarityCount(
  matchedItems: ReturnType<typeof extractInteractionSignals>[]
): number {
  if (matchedItems.length < 2) return 0

  let similarPairs = 0
  for (let i = 0; i < matchedItems.length; i += 1) {
    for (let j = i + 1; j < matchedItems.length; j += 1) {
      const first = matchedItems[i].item
      const second = matchedItems[j].item
      const firstTokens = new Set<string>([
        ...tokenize(first.category ?? ''),
        ...tokenize(first.mechanism ?? ''),
      ])
      const secondTokens = new Set<string>([
        ...tokenize(second.category ?? ''),
        ...tokenize(second.mechanism ?? ''),
      ])

      const overlap = Array.from(firstTokens).filter(token => secondTokens.has(token))
      if (overlap.length >= 2) similarPairs += 1
    }
  }

  return similarPairs
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

function buildFindingExplanation({
  signalLabel,
  sharedTags,
  overlappingMechanisms,
  knownPatternCount,
  compoundSimilarityCount,
}: {
  signalLabel: string
  sharedTags: number
  overlappingMechanisms: string[]
  knownPatternCount: number
  compoundSimilarityCount: number
}): string {
  const mechanismClause = overlappingMechanisms.length
    ? ` Shared mechanism clues include ${overlappingMechanisms.map(toDisplayMechanismLabel).join(', ')}.`
    : ''

  const sharedTagClause =
    sharedTags > 1
      ? ` Multiple aligned interaction tags (${sharedTags}) point in the same direction.`
      : sharedTags === 1
        ? ' One aligned interaction tag appears across the selected items.'
        : ''

  const patternClause =
    knownPatternCount > 0
      ? ` This also matches ${knownPatternCount} known interaction pattern${knownPatternCount > 1 ? 's' : ''} used in this checker.`
      : ''

  const similarityClause =
    compoundSimilarityCount > 0
      ? ` Similarity between item mechanisms/categories was found in ${compoundSimilarityCount} pair${compoundSimilarityCount > 1 ? 's' : ''}, increasing trust in this signal.`
      : ''

  return `${signalLabel}${sharedTagClause}${mechanismClause}${patternClause}${similarityClause}`.trim()
}

function createScoredFinding({
  title,
  summary,
  baseSeverity,
  signalLabel,
  matchedItems,
  signalTags,
  evidenceBasis,
  whatThisMeans,
  whatToWatchFor,
  saferAlternatives = [],
  section = 'summary',
}: {
  title: string
  summary: string
  baseSeverity: InteractionSeverity
  signalLabel: string
  matchedItems: ReturnType<typeof extractInteractionSignals>[]
  signalTags: string[]
  evidenceBasis: string[]
  whatThisMeans: string
  whatToWatchFor: string[]
  saferAlternatives?: string[]
  section?: InteractionFinding['section']
}): InteractionFinding {
  const { basis, sourceConfidence } = resolveFindingBasisAndConfidence(matchedItems, signalTags)
  const sharedTagCount = getSharedTagCount(matchedItems)
  const overlappingMechanisms = getOverlappingMechanisms(matchedItems)
  const overlappingMechanismCount = overlappingMechanisms.length
  const knownPatternCount = getKnownPatternCount(matchedItems, signalTags)
  const compoundSimilarityCount = getCompoundSimilarityCount(matchedItems)

  const weightedScore = clampScore(
    severityToBaseScore(baseSeverity) +
      sharedTagCount * 9 +
      overlappingMechanismCount * 8 +
      knownPatternCount * 10 +
      compoundSimilarityCount * 7 +
      (sourceConfidence === 'high' ? 5 : sourceConfidence === 'medium' ? 1 : -7)
  )

  return {
    title,
    severity: scoreToSeverity(weightedScore),
    confidence: scoreToConfidence(weightedScore),
    confidenceScore: weightedScore,
    basis,
    summary,
    explanation: buildFindingExplanation({
      signalLabel,
      sharedTags: sharedTagCount,
      overlappingMechanisms,
      knownPatternCount,
      compoundSimilarityCount,
    }),
    whatThisMeans,
    whatToWatchFor,
    saferAlternatives,
    sharedTagCount,
    overlappingMechanismCount,
    overlappingMechanisms,
    knownPatternCount,
    compoundSimilarityCount,
    evidenceBasis,
    section,
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

function getVerdict(severity: InteractionSeverity): InteractionVerdict {
  if (severity === 'high') return 'Avoid / high concern'
  if (severity === 'moderate') return 'Use caution'
  return 'Low concern'
}

function getSharedPhrases(
  items: InteractionSourceItem[],
  field: 'effects' | 'activeCompounds'
): string[] {
  const phraseCounts = new Map<string, number>()
  items.forEach(item => {
    const unique = new Set(normalizeList(item[field]))
    unique.forEach(phrase => {
      phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1)
    })
  })
  return Array.from(phraseCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([phrase]) => phrase)
    .slice(0, 5)
}

function toLabelList(values: string[]): string {
  return values.map(toDisplayMechanismLabel).join(', ')
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
        whatThisMeans:
          'This combination may feel heavier than expected, especially if doses are close together or taken late in the day.',
        whatToWatchFor: [
          'Unusual daytime sleepiness or trouble concentrating.',
          'Slower reaction time during driving, training, or work tasks.',
          'Next-morning grogginess after evening use.',
        ],
        saferAlternatives: [
          'Keep only one sedative-leaning item in the same time window.',
          'Use lower doses and separate by several hours before stacking.',
        ],
        section: 'stacking',
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
        whatThisMeans:
          'Energy effects may stack faster than expected, making the combo feel harsher than each item alone.',
        whatToWatchFor: [
          'Jitters, nervousness, or feeling “wired but tired.”',
          'Racing heart, restlessness, or difficulty winding down.',
          'Sleep onset delay if used later in the day.',
        ],
        saferAlternatives: [
          'Use one stimulant-forward item at a time.',
          'Move stimulating items to earlier hours and avoid late-day overlap.',
        ],
        section: 'stacking',
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
        whatThisMeans:
          'Stacking serotonin-active items can make effects less predictable and increase side-effect burden.',
        whatToWatchFor: [
          'Restlessness, sweating, GI upset, tremor, or unusual agitation.',
          'Rapid mood swings or feeling overstimulated at low doses.',
        ],
        saferAlternatives: [
          'Avoid introducing multiple serotonergic items in the same week.',
          'Use single-item trials before any combination attempt.',
        ],
        section: 'safety',
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
        whatThisMeans:
          'This is a higher-complexity combination where small dose changes can produce outsized effects.',
        whatToWatchFor: [
          'Stronger-than-expected response to normal doses.',
          'Headache, blood pressure shifts, or unusual agitation.',
          'Any rapidly escalating symptoms after combination use.',
        ],
        saferAlternatives: [
          'Avoid combining MAOI-like items with serotonergic or strong stimulant items.',
          'If uncertain, do not stack—seek clinician guidance first.',
        ],
        section: 'safety',
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
        whatThisMeans:
          'Cardiovascular load may increase when these are used together, especially with higher doses or dehydration.',
        whatToWatchFor: [
          'Noticeably elevated resting heart rate.',
          'Palpitations or uncomfortable blood pressure sensations.',
          'Exercise intolerance versus your normal baseline.',
        ],
        saferAlternatives: [
          'Avoid stacking multiple activating items in one serving.',
          'Use hydration, food timing, and conservative dose steps.',
        ],
        section: 'safety',
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
        whatThisMeans:
          'The liver may need to process a heavier combined load, making longer-term use riskier without monitoring.',
        whatToWatchFor: [
          'Persistent nausea, unusual fatigue, or upper-right abdominal discomfort.',
          'Dark urine, pale stool, or yellowing symptoms that need urgent evaluation.',
        ],
        saferAlternatives: [
          'Do not layer multiple liver-stressing items in the same routine.',
          'Use shorter cycles and pause promptly if warning signs appear.',
        ],
        section: 'safety',
      })
    )
  }

  const selectedSourceItems = extracted.map(entry => entry.item)
  const overlappingEffects = getSharedPhrases(selectedSourceItems, 'effects')
  if (overlappingEffects.length > 0) {
    findings.push(
      createScoredFinding({
        title: 'Overlapping effects',
        baseSeverity: overlappingEffects.length >= 3 ? 'moderate' : 'low',
        signalLabel: `Shared effect descriptors were found across selected herbs: ${toLabelList(overlappingEffects)}.`,
        summary:
          'Two or more selected herbs share effect descriptors. This can make outcome intensity less predictable when doses are combined.',
        matchedItems: extracted,
        signalTags: [],
        evidenceBasis: overlappingEffects.map(effect => `shared effect: ${effect}`),
        whatThisMeans:
          'Similar effects can stack, so a combination may feel stronger than each herb used separately.',
        whatToWatchFor: [
          'Effects arriving faster than expected after normal single-herb doses.',
          'Combination feeling stronger or longer-lasting than expected.',
        ],
        saferAlternatives: [
          'Start with one herb as the anchor and add only one new herb at a low amount.',
          'Increase spacing between herbs before increasing amount.',
        ],
        section: 'effects',
      })
    )
  }

  const overlappingCompounds = getSharedPhrases(selectedSourceItems, 'activeCompounds')
  if (overlappingCompounds.length > 0) {
    findings.push(
      createScoredFinding({
        title: 'Overlapping compounds',
        baseSeverity: overlappingCompounds.length >= 3 ? 'moderate' : 'low',
        signalLabel: `Shared compound labels were found across selected herbs: ${toLabelList(overlappingCompounds)}.`,
        summary:
          'The selected herbs share one or more compound labels, which can increase overlap in biological signaling.',
        matchedItems: extracted,
        signalTags: [],
        evidenceBasis: overlappingCompounds.map(compound => `shared compound: ${compound}`),
        whatThisMeans:
          'When herbs share compounds or close analogs, overlap is more plausible and effects can be less independent.',
        whatToWatchFor: [
          'A stronger-than-expected response from standard doses.',
          'Repeated overlap symptoms each time this pair/trio is used.',
        ],
        saferAlternatives: [
          'Prefer combinations that diversify, rather than duplicate, major active compounds.',
        ],
        section: 'compounds',
      })
    )
  }

  if (sedativeItems.length >= 1 && stimulantItems.length >= 1) {
    const mergedItems = [...new Set([...sedativeItems, ...stimulantItems])]
    findings.push(
      createScoredFinding({
        title: 'Stimulation/sedation push-pull',
        baseSeverity: 'moderate',
        signalLabel:
          'This set mixes activating and sedating signals, which can create an unstable push-pull effect profile.',
        summary:
          'The selected herbs include both stimulating and sedating signals. That push-pull can feel inconsistent and harder to self-titrate.',
        matchedItems: mergedItems,
        signalTags: ['sedative', 'cns-depressant', 'gabaergic', 'stimulant'],
        evidenceBasis: [
          ...collectEvidence(sedativeItems, ['sedative', 'cns-depressant', 'gabaergic']),
          ...collectEvidence(stimulantItems, ['stimulant']),
        ],
        whatThisMeans:
          'A push-pull profile can mask early warning signs and increase the chance of over-correction dosing.',
        whatToWatchFor: [
          'Alternating wired and sleepy periods in the same session.',
          'Repeated redosing to chase balance.',
        ],
        saferAlternatives: [
          'Use a clearly calming or clearly activating profile per session, not both.',
          'If combining anyway, lower both doses and widen timing intervals.',
        ],
        section: 'stacking',
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
      whatThisMeans:
        'Treat this report as preliminary. Unknowns are higher than usual for this combination.',
      whatToWatchFor: [
        'Unexpected effects even at low doses.',
        'Any symptom pattern that differs from your prior single-item experience.',
      ],
      saferAlternatives: [
        'Prioritize combinations with better-documented items and clearer safety tags.',
      ],
      sharedTagCount: 0,
      overlappingMechanismCount: 0,
      overlappingMechanisms: [],
      knownPatternCount: 0,
      compoundSimilarityCount: 0,
      evidenceBasis: sparseDataItems.map(item => `${item.item.name}: limited structured fields`),
      section: 'data',
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
    'Scoring combines mechanism overlap, known interaction patterns, and compound similarity to improve consistency.',
  ]

  if (dataLimited) {
    notes.push('Some selected entries have limited safety data, so this report may be incomplete.')
  }

  return {
    items: selected.map(item => item.name),
    findings,
    summary: buildReportSummary(primaryFindings, dataLimited),
    verdict: getVerdict(overallSeverity),
    keySignals,
    overallSeverity,
    overallConfidence,
    overallConfidenceScore: weightedAverage,
    dataLimited,
    notes,
  }
}
