import {
  approvedClaims,
  type ResearchClaim,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type ClaimLanguageCalibrationFinding = {
  url: string
  claimId: string
  confidence: number
  claim: string
  causalTerms: string[]
  hedged: boolean
  controlledHuman: number
  uncontrolledHuman: number
  synthesis: number
  narrative: number
  causalWithoutDirectControlledSupport: boolean
  synthesisOnlyCausalSupport: boolean
  causalWithoutControlledSupport: boolean
  highConfidenceCausalWithoutControlledSupport: boolean
}

export type ClaimLanguageCalibrationReport = {
  generatedAt: string
  summary: {
    approvedOutcomeClaims: number
    directCausalOutcomeClaims: number
    causalWithoutDirectControlledSupport: number
    highConfidenceCausalWithoutDirectControlledSupport: number
    synthesisOnlyCausalSupport: number
    highConfidenceSynthesisOnlyCausalSupport: number
    causalWithoutControlledSupport: number
    highConfidenceCausalWithoutControlledSupport: number
  }
  findings: ClaimLanguageCalibrationFinding[]
  highConfidenceFindings: ClaimLanguageCalibrationFinding[]
  directEvidenceFindings: ClaimLanguageCalibrationFinding[]
  highConfidenceDirectEvidenceFindings: ClaimLanguageCalibrationFinding[]
  synthesisOnlyFindings: ClaimLanguageCalibrationFinding[]
}

const CAUSAL_PATTERNS: Array<[string, RegExp]> = [
  ['improves', /\bimprov(?:e|es|ed|ing)\b/i],
  ['reduces', /\breduc(?:e|es|ed|ing)\b/i],
  ['increases', /\bincreas(?:e|es|ed|ing)\b/i],
  ['decreases', /\bdecreas(?:e|es|ed|ing)\b/i],
  ['lowers', /\blower(?:s|ed|ing)?\b/i],
  ['raises', /\brais(?:e|es|ed|ing)\b/i],
  ['prevents', /\bprevent(?:s|ed|ing)?\b/i],
  ['treats', /\btreat(?:s|ed|ing)?\b/i],
  ['causes', /\bcaus(?:e|es|ed|ing)\b/i],
  ['enhances', /\benhanc(?:e|es|ed|ing)\b/i],
  ['protects', /\bprotect(?:s|ed|ing)?\b/i],
]

const HEDGE_PATTERNS = [
  /\bmay\b/i,
  /\bmight\b/i,
  /\bcould\b/i,
  /\bpossible\b/i,
  /\bpossibly\b/i,
  /\bsuggest(?:s|ed)?\b/i,
  /\bappears?\b/i,
  /\bassociated with\b/i,
  /\bwas associated\b/i,
  /\bpotential(?:ly)?\b/i,
  /\bpreliminary\b/i,
  /\blimited evidence\b/i,
  /\buncertain\b/i,
  /\bnot establish\b/i,
]

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function causalTerms(value: string): string[] {
  return CAUSAL_PATTERNS.filter(([, pattern]) => pattern.test(value)).map(([label]) => label)
}

function isHedged(value: string): boolean {
  return HEDGE_PATTERNS.some((pattern) => pattern.test(value))
}

function rawClaimIndex(analysis: ResearchQualityAnalysis): Map<string, ResearchClaim> {
  const index = new Map<string, ResearchClaim>()
  for (const { url, record } of analysis.profiles) {
    for (const claim of approvedClaims(record)) {
      index.set(`${url}::${text(claim.id)}`, claim)
    }
  }
  return index
}

export function analyzeClaimLanguageCalibration(analysis: ResearchQualityAnalysis): ClaimLanguageCalibrationReport {
  const rawClaims = rawClaimIndex(analysis)
  const findings: ClaimLanguageCalibrationFinding[] = []
  const directEvidenceFindings: ClaimLanguageCalibrationFinding[] = []
  let approvedOutcomeClaims = 0
  let directCausalOutcomeClaims = 0

  for (const claim of analysis.claimAnalyses) {
    if (!claim.outcomeClaim) continue
    approvedOutcomeClaims += 1

    const raw = rawClaims.get(`${claim.url}::${claim.claimId}`)
    const claimText = text(raw?.claim)
    if (!claimText) continue

    const terms = causalTerms(claimText)
    const hedged = isHedged(claimText)
    if (!terms.length || hedged) continue
    directCausalOutcomeClaims += 1

    const controlledHuman = claim.designs.filter((design) => design === 'rct' || design === 'controlled-trial').length
    const uncontrolledHuman = claim.designs.filter((design) => design === 'uncontrolled-trial').length
    const synthesis = claim.synthesis
    const narrative = claim.narrative
    const causalWithoutDirectControlledSupport = controlledHuman === 0
    const synthesisOnlyCausalSupport = causalWithoutDirectControlledSupport && synthesis > 0
    // Compatibility: this remains the stricter legacy finding where neither
    // direct controlled-human evidence nor synthesis is linked.
    const causalWithoutControlledSupport = causalWithoutDirectControlledSupport && synthesis === 0
    const highConfidenceCausalWithoutControlledSupport = causalWithoutControlledSupport && claim.confidence >= 0.75

    const finding: ClaimLanguageCalibrationFinding = {
      url: claim.url,
      claimId: claim.claimId,
      confidence: claim.confidence,
      claim: claimText,
      causalTerms: terms,
      hedged,
      controlledHuman,
      uncontrolledHuman,
      synthesis,
      narrative,
      causalWithoutDirectControlledSupport,
      synthesisOnlyCausalSupport,
      causalWithoutControlledSupport,
      highConfidenceCausalWithoutControlledSupport,
    }

    if (causalWithoutDirectControlledSupport) directEvidenceFindings.push(finding)
    if (causalWithoutControlledSupport) findings.push(finding)
  }

  const sorter = (a: ClaimLanguageCalibrationFinding, b: ClaimLanguageCalibrationFinding) =>
    b.confidence - a.confidence || a.url.localeCompare(b.url) || a.claimId.localeCompare(b.claimId)
  findings.sort(sorter)
  directEvidenceFindings.sort(sorter)
  const highConfidenceFindings = findings.filter((finding) => finding.highConfidenceCausalWithoutControlledSupport)
  const highConfidenceDirectEvidenceFindings = directEvidenceFindings.filter((finding) => finding.confidence >= 0.75)
  const synthesisOnlyFindings = directEvidenceFindings.filter((finding) => finding.synthesisOnlyCausalSupport)

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      approvedOutcomeClaims,
      directCausalOutcomeClaims,
      causalWithoutDirectControlledSupport: directEvidenceFindings.length,
      highConfidenceCausalWithoutDirectControlledSupport: highConfidenceDirectEvidenceFindings.length,
      synthesisOnlyCausalSupport: synthesisOnlyFindings.length,
      highConfidenceSynthesisOnlyCausalSupport: synthesisOnlyFindings.filter((finding) => finding.confidence >= 0.75).length,
      causalWithoutControlledSupport: findings.length,
      highConfidenceCausalWithoutControlledSupport: highConfidenceFindings.length,
    },
    findings,
    highConfidenceFindings,
    directEvidenceFindings,
    highConfidenceDirectEvidenceFindings,
    synthesisOnlyFindings,
  }
}
