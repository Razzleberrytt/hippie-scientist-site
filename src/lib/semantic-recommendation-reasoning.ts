import { list, text, unique } from '@/lib/display-utils'

export type SemanticRecommendationReason = {
  title: string
  explanation: string
  signals: string[]
  confidence: 'high' | 'moderate' | 'exploratory'
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function title(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function signals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

function evidenceConfidence(record: any): SemanticRecommendationReason['confidence'] {
  const evidence = normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.profile_status)

  if (/strong|clinical|human|high|complete/.test(evidence)) return 'high'
  if (/moderate|limited|traditional|mixed/.test(evidence)) return 'moderate'
  return 'exploratory'
}

export function explainSemanticRecommendation(source: any, target: any): SemanticRecommendationReason {
  const sourceSignals = signals(source)
  const targetSignals = signals(target)
  const shared = sourceSignals.filter((signal) =>
    targetSignals.some((candidate) => candidate.includes(signal) || signal.includes(candidate)),
  )
  const confidence = evidenceConfidence(target)
  const targetName = title(text(target?.displayName || target?.name || target?.slug || 'this profile'))

  if (shared.length > 0) {
    return {
      title: `Why ${targetName} appears here`,
      explanation: `${targetName} is recommended because it shares semantic signals with the current research path, especially ${shared.slice(0, 3).map(title).join(', ')}. Use this as a pathway bridge, not as a medical conclusion.`,
      signals: shared.slice(0, 5).map(title),
      confidence,
    }
  }

  return {
    title: `Why ${targetName} may still be relevant`,
    explanation: `${targetName} is included as an adjacent exploration candidate because it may connect through broader ecosystem, evidence, or routine-level context. Review mechanism and safety details before treating it as a close match.`,
    signals: targetSignals.slice(0, 5).map(title),
    confidence,
  }
}

export function explainTraversalChoice(item: { title: string; description: string; signals?: string[]; score?: number }) {
  const score = item.score || 0
  const confidence: SemanticRecommendationReason['confidence'] = score >= 8 ? 'high' : score >= 4 ? 'moderate' : 'exploratory'

  return {
    title: `Why this path is suggested`,
    explanation: item.description || 'This path is suggested because it continues the current semantic thread through related evidence, mechanisms, or ecosystem context.',
    signals: (item.signals || []).slice(0, 5),
    confidence,
  }
}

export function explainDecisionContext(record: any) {
  const recordSignals = signals(record).slice(0, 5).map(title)
  const confidence = evidenceConfidence(record)

  return {
    title: 'How to interpret this recommendation',
    explanation: 'Use semantic recommendations as research navigation, not personalized medical advice. Stronger confidence means the profile has clearer evidence or richer semantic context, not guaranteed benefit.',
    signals: recordSignals,
    confidence,
  }
}
