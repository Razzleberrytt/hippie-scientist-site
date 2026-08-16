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
  causalWithoutControlledSupport: boolean
  highConfidenceCausalWithoutControlledSupport: boolean
}

export type ClaimLanguageCalibrationReport = {
  generatedAt: string
  summary: {
    approvedOutcomeClaims: number
    directCausalOutcomeClaims: number
    causalWithoutControlledSupport: number
    highConfidenceCausalWithoutControlledSupport: number
  }
  findings: ClaimLanguageCalibrationFinding[]
  highConfidenceFindings: ClaimLanguageCalibrationFinding[]
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
    const causalWithoutControlledSupport = controlledHuman === 0 && synthesis === 0
    const highConfidenceCausalWithoutControlledSupport = causalWithoutControlledSupport && claim.confidence >= 0.75

    if (!causalWithoutControlledSupport) continue

    findings.push({
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
      causalWithoutControlledSupport,
      highConfidenceCausalWithoutControlledSupport,
    })
  }

  findings.sort((a, b) => b.confidence - a.confidence || a.url.localeCompare(b.url) || a.claimId.localeCompare(b.claimId))
  const highConfidenceFindings = findings.filter((finding) => finding.highConfidenceCausalWithoutControlledSupport)

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      approvedOutcomeClaims,
      directCausalOutcomeClaims,
      causalWithoutControlledSupport: findings.length,
      highConfidenceCausalWithoutControlledSupport: highConfidenceFindings.length,
    },
    findings,
    highConfidenceFindings,
  }
}
