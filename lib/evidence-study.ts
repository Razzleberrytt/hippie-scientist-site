export type EvidenceStudyClass =
  | 'meta_analysis'
  | 'systematic_review'
  | 'randomized_controlled_trial'
  | 'controlled_trial'
  | 'observational'
  | 'case_report'
  | 'animal'
  | 'in_vitro'
  | 'mechanistic'
  | 'narrative_review'
  | 'other'

export type EvidenceRelationship =
  | 'supports'
  | 'mixed'
  | 'contradicts'
  | 'no_clear_effect'
  | 'background'

export type EvidenceConfidence = 'high' | 'moderate' | 'low' | 'unknown'

export type EvidenceStudyRecord = {
  id: string
  title: string
  authors?: string
  journal?: string
  year?: number | string
  pmid?: string
  doi?: string
  url?: string
  studyType?: string
  evidenceClass: EvidenceStudyClass
  sampleSize?: number | string
  dose?: string
  duration?: string
  population?: string
  outcome?: string
  result?: string
  limitation?: string
  relationship: EvidenceRelationship
  confidence: EvidenceConfidence
  statisticalConsistency?: string
  extractName?: string
  ingredients?: string[]
  conditions?: string[]
  safetyOutcome?: string
}

const HUMAN_CLASSES = new Set<EvidenceStudyClass>([
  'meta_analysis',
  'systematic_review',
  'randomized_controlled_trial',
  'controlled_trial',
  'observational',
  'case_report',
])

export function normalizeEvidenceStudyClass(value: unknown): EvidenceStudyClass {
  const lower = String(value || '').trim().toLowerCase()

  if (!lower) return 'other'
  if (lower.includes('meta-analysis') || lower.includes('meta analysis') || lower.includes('meta_analysis')) return 'meta_analysis'
  if (lower.includes('systematic review') || lower.includes('systematic_review')) return 'systematic_review'
  if (
    lower.includes('randomized') ||
    lower.includes('randomised') ||
    lower.includes('rct') ||
    lower.includes('placebo-controlled') ||
    lower.includes('placebo controlled')
  ) return 'randomized_controlled_trial'
  if (lower.includes('controlled trial') || lower.includes('clinical trial') || lower.includes('intervention')) return 'controlled_trial'
  if (
    lower.includes('observational') ||
    lower.includes('cohort') ||
    lower.includes('cross-sectional') ||
    lower.includes('cross sectional') ||
    lower.includes('case-control') ||
    lower.includes('case control')
  ) return 'observational'
  if (lower.includes('case report') || lower.includes('case series')) return 'case_report'
  if (lower.includes('animal') || lower.includes('rodent') || lower.includes('murine') || lower.includes('in vivo')) return 'animal'
  if (lower.includes('in vitro') || lower.includes('cell') || lower.includes('cellular')) return 'in_vitro'
  if (lower.includes('mechanistic') || lower.includes('mechanism')) return 'mechanistic'
  if (lower.includes('review')) return 'narrative_review'

  return 'other'
}

export function formatEvidenceStudyClass(value: EvidenceStudyClass): string {
  const labels: Record<EvidenceStudyClass, string> = {
    meta_analysis: 'Meta-analysis',
    systematic_review: 'Systematic review',
    randomized_controlled_trial: 'Randomized controlled trial',
    controlled_trial: 'Controlled trial',
    observational: 'Observational research',
    case_report: 'Case report',
    animal: 'Animal research',
    in_vitro: 'In-vitro research',
    mechanistic: 'Mechanistic research',
    narrative_review: 'Narrative review',
    other: 'Other / unclear',
  }
  return labels[value]
}

export function normalizeEvidenceRelationship(value: unknown): EvidenceRelationship {
  const lower = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (lower === 'support' || lower === 'supportive' || lower === 'supports' || lower === 'positive') return 'supports'
  if (lower === 'mixed' || lower === 'partially_supports' || lower === 'partial') return 'mixed'
  if (lower === 'contradict' || lower === 'contradicting' || lower === 'contradicts' || lower === 'negative') return 'contradicts'
  if (lower === 'no_effect' || lower === 'null' || lower === 'neutral' || lower === 'no_clear_effect') return 'no_clear_effect'
  return 'background'
}

export function normalizeEvidenceConfidence(value: unknown): EvidenceConfidence {
  const lower = String(value || '').trim().toLowerCase()
  if (lower === 'high' || lower === 'strong') return 'high'
  if (lower === 'moderate' || lower === 'medium') return 'moderate'
  if (lower === 'low' || lower === 'limited') return 'low'
  return 'unknown'
}

export function isHumanEvidenceClass(value: EvidenceStudyClass): boolean {
  return HUMAN_CLASSES.has(value)
}

export function isHumanTrialClass(value: EvidenceStudyClass): boolean {
  return value === 'randomized_controlled_trial' || value === 'controlled_trial'
}

export function parseSampleSize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value)
  const text = String(value || '').trim()
  if (!text) return null

  const explicitN = text.match(/\bn\s*=\s*([\d,]+)/i)
  const firstNumber = explicitN?.[1] || text.match(/([\d,]+)/)?.[1]
  if (!firstNumber) return null

  const parsed = Number(firstNumber.replace(/,/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null
}

export function evidenceStudyId(input: {
  pmid?: string
  doi?: string
  url?: string
  title?: string
}): string {
  if (input.pmid) return `pmid:${String(input.pmid).trim()}`
  if (input.doi) return `doi:${String(input.doi).trim().toLowerCase()}`
  if (input.url) return `url:${String(input.url).trim().toLowerCase()}`

  const slug = String(input.title || 'untitled')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

  return `title:${slug || 'untitled'}`
}

export function evidenceSourceUrl(input: { pmid?: string; doi?: string; url?: string }): string | undefined {
  const rawUrl = String(input.url || '').trim()
  if (rawUrl) return rawUrl
  if (input.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${String(input.pmid).trim()}/`
  if (input.doi) return `https://doi.org/${String(input.doi).trim()}`
  return undefined
}

export function evidenceRelationshipLabel(value: EvidenceRelationship): string {
  const labels: Record<EvidenceRelationship, string> = {
    supports: 'Supports',
    mixed: 'Mixed',
    contradicts: 'Contradicts',
    no_clear_effect: 'No clear effect',
    background: 'Background',
  }
  return labels[value]
}

export type EvidenceStudyMetrics = {
  totalStudies: number
  humanStudies: number
  humanTrials: number
  approximateParticipants: number
  studiesWithParticipantCounts: number
  supportive: number
  mixed: number
  contradicting: number
  noClearEffect: number
  background: number
  consistency: 'consistent' | 'mostly_consistent' | 'mixed' | 'conflicting' | 'unclear'
}

export function summarizeEvidenceStudies(studies: EvidenceStudyRecord[]): EvidenceStudyMetrics {
  let humanStudies = 0
  let humanTrials = 0
  let approximateParticipants = 0
  let studiesWithParticipantCounts = 0
  let supportive = 0
  let mixed = 0
  let contradicting = 0
  let noClearEffect = 0
  let background = 0

  for (const study of studies) {
    if (isHumanEvidenceClass(study.evidenceClass)) humanStudies += 1
    if (isHumanTrialClass(study.evidenceClass)) humanTrials += 1

    const n = parseSampleSize(study.sampleSize)
    if (n && isHumanEvidenceClass(study.evidenceClass)) {
      approximateParticipants += n
      studiesWithParticipantCounts += 1
    }

    switch (study.relationship) {
      case 'supports': supportive += 1; break
      case 'mixed': mixed += 1; break
      case 'contradicts': contradicting += 1; break
      case 'no_clear_effect': noClearEffect += 1; break
      default: background += 1
    }
  }

  const directional = supportive + mixed + contradicting + noClearEffect
  let consistency: EvidenceStudyMetrics['consistency'] = 'unclear'
  if (directional > 0) {
    const supportShare = supportive / directional
    const contradictionShare = (contradicting + noClearEffect) / directional
    if (supportShare >= 0.8 && contradictionShare <= 0.1) consistency = 'consistent'
    else if (supportShare >= 0.6 && contradictionShare <= 0.25) consistency = 'mostly_consistent'
    else if (supportive > 0 && contradicting > 0) consistency = 'conflicting'
    else consistency = 'mixed'
  }

  return {
    totalStudies: studies.length,
    humanStudies,
    humanTrials,
    approximateParticipants,
    studiesWithParticipantCounts,
    supportive,
    mixed,
    contradicting,
    noClearEffect,
    background,
    consistency,
  }
}

export function evidenceConsistencyLabel(value: EvidenceStudyMetrics['consistency']): string {
  const labels: Record<EvidenceStudyMetrics['consistency'], string> = {
    consistent: 'Statistically directionally consistent',
    mostly_consistent: 'Mostly consistent',
    mixed: 'Mixed / heterogeneous',
    conflicting: 'Material disagreement present',
    unclear: 'Consistency not yet classifiable',
  }
  return labels[value]
}
