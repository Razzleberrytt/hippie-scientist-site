import type { CanonicalEvidenceGrade } from '@/lib/evidence-grade'

export type ClaimStrength =
  | 'may-improve'
  | 'probably-improves'
  | 'shown-to-improve'
  | 'insufficient-evidence'
  | 'no-meaningful-effect'
  | 'conflicting-evidence'

export const CLAIM_STRENGTH_LABELS: Record<ClaimStrength, string> = {
  'may-improve': 'may improve',
  'probably-improves': 'probably improves',
  'shown-to-improve': 'has been shown to improve',
  'insufficient-evidence': 'insufficient evidence',
  'no-meaningful-effect': 'evidence suggests no meaningful effect',
  'conflicting-evidence': 'evidence is conflicting',
}

const ALLOWED_STRENGTHS: Record<CanonicalEvidenceGrade, ClaimStrength[]> = {
  A: ['may-improve', 'probably-improves', 'shown-to-improve', 'no-meaningful-effect', 'conflicting-evidence'],
  B: ['may-improve', 'probably-improves', 'no-meaningful-effect', 'conflicting-evidence'],
  C: ['may-improve', 'insufficient-evidence', 'no-meaningful-effect', 'conflicting-evidence'],
  D: ['insufficient-evidence', 'conflicting-evidence'],
  'Avoid/Insufficient': ['insufficient-evidence', 'no-meaningful-effect', 'conflicting-evidence'],
}

export function isClaimStrengthAllowed(grade: CanonicalEvidenceGrade, strength: ClaimStrength) {
  return ALLOWED_STRENGTHS[grade].includes(strength)
}

export function strongestAllowedClaimStrength(grade: CanonicalEvidenceGrade): ClaimStrength {
  if (grade === 'A') return 'shown-to-improve'
  if (grade === 'B') return 'probably-improves'
  if (grade === 'C') return 'may-improve'
  return 'insufficient-evidence'
}

export type ClaimEvidenceContext = {
  grade: CanonicalEvidenceGrade
  strength: ClaimStrength
  studyDesigns?: Array<'randomized-trial' | 'observational' | 'animal' | 'in-vitro' | 'review' | 'other'>
  independentHumanTrialCount?: number
  largestHumanTrialSize?: number
  diseaseContextException?: boolean
}

export type ClaimLanguageFinding = {
  code:
    | 'strength-exceeds-grade'
    | 'overclaim-word'
    | 'disease-treatment-wording'
    | 'observational-causality'
    | 'preclinical-human-benefit'
    | 'single-small-trial-generalization'
  severity: 'warning' | 'error'
  message: string
  matched?: string
}

const OVERCLAIM_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bproven\b/i, label: 'proven' },
  { re: /\bworks?\b/i, label: 'works' },
  { re: /\beffective\b/i, label: 'effective' },
]

const DISEASE_TREATMENT_RE = /\b(?:treats?|treating|cures?|prevents?|reverses?|heals?)\s+(?:[a-z][a-z -]{2,40})/i
const CAUSAL_RE = /\b(?:causes?|leads? to|results? in|produces?|drives?|improves?|reduces?|increases?)\b/i
const HUMAN_BENEFIT_RE = /\b(?:people|humans?|adults?|patients?|users?|you)\b.*\b(?:benefit|improve|reduce|increase|help|effective)\b/i
const GENERALIZATION_RE = /\b(?:generally|typically|people|users|adults|most|everyone|consumers?)\b/i

export function lintClaimLanguage(text: string, context: ClaimEvidenceContext): ClaimLanguageFinding[] {
  const findings: ClaimLanguageFinding[] = []

  if (!isClaimStrengthAllowed(context.grade, context.strength)) {
    findings.push({
      code: 'strength-exceeds-grade',
      severity: 'error',
      message: `Claim strength “${CLAIM_STRENGTH_LABELS[context.strength]}” exceeds what grade ${context.grade} permits.`,
    })
  }

  for (const pattern of OVERCLAIM_PATTERNS) {
    const match = text.match(pattern.re)
    if (!match) continue
    const allowed = context.grade === 'A' && context.strength === 'shown-to-improve' && pattern.label === 'effective'
    if (!allowed) {
      findings.push({
        code: 'overclaim-word',
        severity: 'error',
        message: `Avoid “${pattern.label}” unless the structured evidence state explicitly justifies that strength.`,
        matched: match[0],
      })
    }
  }

  if (!context.diseaseContextException) {
    const diseaseMatch = text.match(DISEASE_TREATMENT_RE)
    if (diseaseMatch) {
      findings.push({
        code: 'disease-treatment-wording',
        severity: 'error',
        message: 'Disease-treatment wording requires explicit regulatory/editorial exception handling.',
        matched: diseaseMatch[0],
      })
    }
  }

  const designs = new Set(context.studyDesigns ?? [])
  const observationalOnly = designs.size > 0 && [...designs].every((design) => design === 'observational')
  if (observationalOnly) {
    const causalMatch = text.match(CAUSAL_RE)
    if (causalMatch) {
      findings.push({
        code: 'observational-causality',
        severity: 'error',
        message: 'Observational evidence must use association language rather than causal wording.',
        matched: causalMatch[0],
      })
    }
  }

  const preclinicalOnly = designs.size > 0 && [...designs].every((design) => design === 'animal' || design === 'in-vitro')
  if (preclinicalOnly && HUMAN_BENEFIT_RE.test(text)) {
    findings.push({
      code: 'preclinical-human-benefit',
      severity: 'error',
      message: 'Human-benefit wording cannot be derived solely from animal or in-vitro evidence.',
    })
  }

  if (
    context.independentHumanTrialCount === 1 &&
    (context.largestHumanTrialSize ?? Number.POSITIVE_INFINITY) < 50 &&
    GENERALIZATION_RE.test(text)
  ) {
    findings.push({
      code: 'single-small-trial-generalization',
      severity: 'warning',
      message: 'A single small human trial should not be generalized to broad populations without an explicit limitation.',
    })
  }

  return findings
}

export type CitationAnchor = {
  id: string
  position: number
  supportsClaimIds: string[]
}

export type PositionedClaim = {
  id: string
  position: number
  importance: 'low' | 'normal' | 'high' | 'medical'
}

export type CitationDistanceFinding = {
  claimId: string
  code: 'missing-citation' | 'citation-too-distant' | 'decorative-citation'
  severity: 'warning' | 'error'
  distance?: number
  citationId?: string
}

export function validateClaimCitationDistance(
  claims: PositionedClaim[],
  citations: CitationAnchor[],
  maxDistance = 260,
): CitationDistanceFinding[] {
  const findings: CitationDistanceFinding[] = []

  for (const claim of claims) {
    const supporting = citations
      .filter((citation) => citation.supportsClaimIds.includes(claim.id))
      .map((citation) => ({ citation, distance: Math.abs(citation.position - claim.position) }))
      .sort((a, b) => a.distance - b.distance)

    if (!supporting.length) {
      findings.push({
        claimId: claim.id,
        code: 'missing-citation',
        severity: claim.importance === 'medical' || claim.importance === 'high' ? 'error' : 'warning',
      })
      continue
    }

    if (supporting[0].distance > maxDistance) {
      findings.push({
        claimId: claim.id,
        code: 'citation-too-distant',
        severity: claim.importance === 'medical' ? 'error' : 'warning',
        citationId: supporting[0].citation.id,
        distance: supporting[0].distance,
      })
    }
  }

  for (const citation of citations) {
    if (citation.supportsClaimIds.length) continue
    findings.push({
      claimId: '',
      code: 'decorative-citation',
      severity: 'warning',
      citationId: citation.id,
    })
  }

  return findings
}

export type ParagraphClaim = {
  id: string
  propositionId: string
}

export type ParagraphCitationCluster = {
  citationIds: string[]
  supportsClaimIds: string[]
}

export function auditParagraphCitationScope(claims: ParagraphClaim[], clusters: ParagraphCitationCluster[]) {
  const findings: string[] = []
  const majorPropositions = new Set(claims.map((claim) => claim.propositionId))

  if (majorPropositions.size > 1 && clusters.length === 1) {
    const supported = new Set(clusters[0].supportsClaimIds)
    const ambiguous = claims.filter((claim) => !supported.has(claim.id))
    if (ambiguous.length) {
      findings.push('Paragraph contains multiple propositions but one citation cluster does not explicitly support every claim.')
    }
  }

  for (const cluster of clusters) {
    const unknownClaims = cluster.supportsClaimIds.filter((id) => !claims.some((claim) => claim.id === id))
    if (unknownClaims.length) findings.push('Citation cluster references claims outside the adjacent paragraph scope.')
  }

  return findings
}

export type EvidenceExtractionLocation =
  | 'abstract'
  | 'full-text'
  | 'table'
  | 'supplement'
  | 'secondary-source'

export type ClaimSourceSupport = {
  claimId: string
  studyId: string
  section?: string
  table?: string
  snippet?: string
  location: EvidenceExtractionLocation
  fullTextVerified: boolean
}

export type SourceSupportAssessment = ClaimSourceSupport & {
  confidenceCeiling: 'high' | 'moderate' | 'low'
  needsFullTextReview: boolean
  reviewerNote?: string
}

export function assessSourceSupport(support: ClaimSourceSupport): SourceSupportAssessment {
  const abstractOnly = support.location === 'abstract' && !support.fullTextVerified
  const secondaryOnly = support.location === 'secondary-source' && !support.fullTextVerified

  return {
    ...support,
    confidenceCeiling: abstractOnly || secondaryOnly ? 'low' : support.fullTextVerified ? 'high' : 'moderate',
    needsFullTextReview: abstractOnly || secondaryOnly,
    reviewerNote: abstractOnly
      ? 'Claim currently relies on abstract-level extraction; verify full text before treating it as high-confidence support.'
      : secondaryOnly
        ? 'Claim currently relies on a secondary source; verify the primary full text when the conclusion is high value.'
        : undefined,
  }
}

export function preferFullTextSupport(support: ClaimSourceSupport[]) {
  return [...support].sort((left, right) => {
    const rank = (item: ClaimSourceSupport) => {
      if (item.fullTextVerified && (item.location === 'table' || item.location === 'supplement')) return 4
      if (item.fullTextVerified && item.location === 'full-text') return 3
      if (item.location === 'abstract') return 2
      return 1
    }
    return rank(right) - rank(left)
  })
}
