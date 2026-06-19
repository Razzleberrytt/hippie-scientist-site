import { list, text } from '@/lib/display-utils'
import { cleanEditorialText, dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
import { buildResearchKnowledgeReport } from '../src/lib/research-knowledge-layer'
import { buildSemanticIntelligenceReport } from '../src/lib/semantic-intelligence-layer'

export type AuthoritySignal = {
  label: string
  description: string
  tone?: 'strong' | 'moderate' | 'caution' | 'neutral'
}

export type AuthorityProfileModel = {
  executiveSummary: AuthoritySignal[]
  bestFor: AuthoritySignal[]
  avoidIf: AuthoritySignal[]
  evidenceHierarchy: AuthoritySignal[]
  mechanisms: AuthoritySignal[]
  timeline: AuthoritySignal[]
  stackCompatibility: AuthoritySignal[]
  editorialInterpretation: AuthoritySignal
  readinessScore: number
  readinessLabel: 'authority-ready' | 'developing' | 'research-needed'
}

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function cleanSignals(values: unknown[], fallbackTone: AuthoritySignal['tone'] = 'neutral'): AuthoritySignal[] {
  return dedupeEditorialItems(values, 6)
    .map((value) => {
      const label = title(value)
      const description = title(value)

      return {
        label,
        description,
        tone: fallbackTone,
      }
    })
    .filter((signal) => shouldRenderCard(signal.label, signal.description))
}

export function buildExecutiveSummary(record: Record<string, unknown>): AuthoritySignal[] {
  const summary = cleanEditorialText(record?.summary || record?.description)
  const evidence = cleanEditorialText(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || 'Evidence context varies')
  const safety = cleanEditorialText(record?.safety_level || record?.safety || record?.safetyNotes || 'Review safety context')

  const signals: AuthoritySignal[] = [
    {
      label: 'What it is',
      description: isRenderableText(summary) ? summary : 'A research profile with semantic evidence, mechanism, and safety context.',
      tone: 'neutral',
    },
    {
      label: 'Evidence confidence',
      description: isRenderableText(evidence) ? title(evidence) : 'Evidence context varies',
      tone: /strong|clinical|human|high/i.test(evidence) ? 'strong' : /moderate|mixed/i.test(evidence) ? 'moderate' : 'neutral',
    },
    {
      label: 'Safety posture',
      description: isRenderableText(safety) ? title(safety) : 'Review safety context',
      tone: /avoid|caution|review|risk/i.test(safety) ? 'caution' : 'neutral',
    },
  ]

  return signals.filter((signal) => shouldRenderCard(signal.label, signal.description))
}

export function buildBestForSignals(record: Record<string, unknown>): AuthoritySignal[] {
  // Placeholder tags like "research pending" and "research only" are suppressed here via the
  // cleanSignals → dedupeEditorialItems → isWeakSemanticValue pipeline in editorial-rendering.ts.
  // Additionally, list() calls formatDisplayLabel() which calls hideInternalValue(), which
  // matches INTERNAL_PATTERNS in display-utils.ts (covers both patterns).
  return cleanSignals([
    ...list(record?.best_for),
    ...list(record?.bestFor),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.goals),
  ], 'strong')
}

export function buildAvoidIfSignals(record: Record<string, unknown>): AuthoritySignal[] {
  const values = [
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.contraindications),
    ...list(record?.warnings),
    ...list(record?.safetyNotes),
  ]

  return cleanSignals(values.length ? values : ['Check interactions, pregnancy status, medications, and medical conditions before use.'], 'caution')
}

export function buildEvidenceHierarchy(record: Record<string, unknown>): AuthoritySignal[] {
  const report = buildResearchKnowledgeReport(record)

  if (report.hierarchy.length > 0) {
    const signals: AuthoritySignal[] = report.hierarchy.slice(0, 5).map((item) => ({
      label: cleanEditorialText(item.label),
      description: cleanEditorialText(item.reason),
      tone: item.confidence === 'high' ? 'strong' : item.confidence === 'moderate' ? 'moderate' : 'neutral',
    }))

    return signals.filter((signal) => shouldRenderCard(signal.label, signal.description))
  }

  return [{
    label: 'Evidence review needed',
    description: report.summary,
    tone: 'caution',
  }]
}

export function buildMechanismSummary(record: Record<string, unknown>): AuthoritySignal[] {
  return cleanSignals([
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.mechanism_of_action),
    ...list(record?.primaryActions),
  ], 'moderate')
}

export function buildTimelineExpectations(record: Record<string, unknown>): AuthoritySignal[] {
  const values = [
    record?.time_to_effect,
    record?.timeToEffect,
    record?.onset,
    record?.duration,
  ].filter(Boolean)

  return cleanSignals(values.length ? values : ['Timing varies by dose, formulation, baseline status, and outcome.'], 'neutral')
}

export function buildStackCompatibility(record: Record<string, unknown>): AuthoritySignal[] {
  const values = [
    ...list(record?.stack_with),
    ...list(record?.synergies),
    ...list(record?.combinations),
    ...list(record?.avoid_stacking_with),
  ]

  return cleanSignals(values.length ? values : ['Use stack context cautiously; watch for overlapping mechanisms and safety considerations.'], 'neutral')
}

export function buildEditorialInterpretation(record: Record<string, unknown>): AuthoritySignal {
  const semantic = buildSemanticIntelligenceReport(record)
  const evidence = buildResearchKnowledgeReport(record)
  const name = title(record?.displayName || record?.name || record?.slug || 'This profile')

  return {
    label: 'Editorial interpretation',
    description: cleanEditorialText(`${name} currently looks ${semantic.priority} from a semantic authority perspective. ${evidence.summary}`),
    tone: semantic.priority === 'high' ? 'strong' : semantic.priority === 'moderate' ? 'moderate' : 'neutral',
  }
}

export function buildAuthorityProfileModel(record: Record<string, unknown>): AuthorityProfileModel {
  const semantic = buildSemanticIntelligenceReport(record)
  const evidence = buildResearchKnowledgeReport(record)
  const readinessScore = semantic.totalScore + Math.min(30, evidence.evidenceWeight)
  const readinessLabel: AuthorityProfileModel['readinessLabel'] =
    readinessScore >= 48 ? 'authority-ready' : readinessScore >= 28 ? 'developing' : 'research-needed'

  return {
    executiveSummary: buildExecutiveSummary(record),
    bestFor: buildBestForSignals(record),
    avoidIf: buildAvoidIfSignals(record),
    evidenceHierarchy: buildEvidenceHierarchy(record),
    mechanisms: buildMechanismSummary(record),
    timeline: buildTimelineExpectations(record),
    stackCompatibility: buildStackCompatibility(record),
    editorialInterpretation: buildEditorialInterpretation(record),
    readinessScore,
    readinessLabel,
  }
}
