import { list, text, unique } from '@/lib/display-utils'
import { buildResearchKnowledgeReport } from '@/lib/research-knowledge-layer'
import { buildSemanticIntelligenceReport } from '@/lib/semantic-intelligence-layer'

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
  return unique(values.map(text).filter(Boolean))
    .slice(0, 6)
    .map((value) => ({
      label: title(value),
      description: title(value),
      tone: fallbackTone,
    }))
}

export function buildExecutiveSummary(record: any): AuthoritySignal[] {
  const summary = text(record?.summary || record?.description)
  const evidence = text(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || 'Evidence context varies')
  const safety = text(record?.safety_level || record?.safety || record?.safetyNotes || 'Review safety context')

  return [
    {
      label: 'What it is',
      description: summary || 'A research profile with semantic evidence, mechanism, and safety context.',
      tone: 'neutral',
    },
    {
      label: 'Evidence confidence',
      description: title(evidence),
      tone: /strong|clinical|human|high/i.test(evidence) ? 'strong' : /moderate|mixed/i.test(evidence) ? 'moderate' : 'neutral',
    },
    {
      label: 'Safety posture',
      description: title(safety),
      tone: /avoid|caution|review|risk/i.test(safety) ? 'caution' : 'neutral',
    },
  ]
}

export function buildBestForSignals(record: any): AuthoritySignal[] {
  return cleanSignals([
    ...list(record?.best_for),
    ...list(record?.bestFor),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.goals),
  ], 'strong')
}

export function buildAvoidIfSignals(record: any): AuthoritySignal[] {
  const values = [
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.contraindications),
    ...list(record?.warnings),
    ...list(record?.safetyNotes),
  ]

  return cleanSignals(values.length ? values : ['Check interactions, pregnancy status, medications, and medical conditions before use.'], 'caution')
}

export function buildEvidenceHierarchy(record: any): AuthoritySignal[] {
  const report = buildResearchKnowledgeReport(record)

  if (report.hierarchy.length > 0) {
    return report.hierarchy.slice(0, 5).map((item) => ({
      label: item.label,
      description: item.reason,
      tone: item.confidence === 'high' ? 'strong' : item.confidence === 'moderate' ? 'moderate' : 'neutral',
    }))
  }

  return [{
    label: 'Evidence review needed',
    description: report.summary,
    tone: 'caution',
  }]
}

export function buildMechanismSummary(record: any): AuthoritySignal[] {
  return cleanSignals([
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.mechanism_of_action),
    ...list(record?.primaryActions),
  ], 'moderate')
}

export function buildTimelineExpectations(record: any): AuthoritySignal[] {
  const values = [
    record?.time_to_effect,
    record?.timeToEffect,
    record?.onset,
    record?.duration,
  ].filter(Boolean)

  return cleanSignals(values.length ? values : ['Timing varies by dose, formulation, baseline status, and outcome.'], 'neutral')
}

export function buildStackCompatibility(record: any): AuthoritySignal[] {
  const values = [
    ...list(record?.stack_with),
    ...list(record?.synergies),
    ...list(record?.combinations),
    ...list(record?.avoid_stacking_with),
  ]

  return cleanSignals(values.length ? values : ['Use stack context cautiously; watch for overlapping mechanisms and safety considerations.'], 'neutral')
}

export function buildEditorialInterpretation(record: any): AuthoritySignal {
  const semantic = buildSemanticIntelligenceReport(record)
  const evidence = buildResearchKnowledgeReport(record)
  const name = title(record?.displayName || record?.name || record?.slug || 'This profile')

  return {
    label: 'Editorial interpretation',
    description: `${name} currently looks ${semantic.priority} from a semantic authority perspective. ${evidence.summary}`,
    tone: semantic.priority === 'high' ? 'strong' : semantic.priority === 'moderate' ? 'moderate' : 'neutral',
  }
}

export function buildAuthorityProfileModel(record: any): AuthorityProfileModel {
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
