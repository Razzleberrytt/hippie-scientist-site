import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  approvedClaims,
  sourceMap,
  sourceStudyClass,
  uniqueSourceRefs,
  type ResearchClaim,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type DirectionalConsistencyFinding = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  favorableClaim: boolean
  humanSourceCount: number
  positiveSourceCount: number
  nullSourceCount: number
  negativeSourceCount: number
  mixedSourceCount: number
  primaryNullOrNegativeSourceCount: number
  secondaryOrSubgroupPositiveSourceCount: number
  endpointCherryPickRisk: boolean
  directionalHeterogeneity: boolean
  uniformlyPositiveOverstatement: boolean
  reasons: string[]
}

export type DirectionalConsistencyReport = {
  summary: {
    approvedOutcomeClaims: number
    assessableClaims: number
    findings: number
    highConfidenceFindings: number
    endpointCherryPickRisks: number
    directionalHeterogeneityClaims: number
    uniformlyPositiveOverstatements: number
  }
  claims: DirectionalConsistencyFinding[]
  findings: DirectionalConsistencyFinding[]
  highConfidenceFindings: DirectionalConsistencyFinding[]
}

const POSITIVE = /\b(significantly (?:improved|reduced|increased|decreased)|significant (?:improvement|reduction|benefit|difference)|improved significantly|reduced significantly|beneficial effect|favou?r(?:ed|s) (?:the )?(?:treatment|intervention)|superior to placebo)\b/i
const NULL = /\b(no significant (?:difference|effect|benefit|improvement|reduction)|not statistically significant|non[- ]significant|did not (?:differ|improve|reduce)|no (?:difference|effect|benefit)|failed to (?:improve|reduce)|similar to placebo|comparable to placebo)\b/i
const NEGATIVE = /\b(significantly worsened|worsened significantly|worse than placebo|inferior to placebo|significant (?:worsening|harm)|increased adverse|favou?red placebo)\b/i
const MIXED = /\b(mixed results?|inconsistent results?|inconsistent findings?|conflicting results?|not consistent across|heterogeneous results?)\b/i

const PRIMARY_NULL_OR_NEGATIVE = /\bprimary (?:outcome|endpoint)[^.]{0,180}(?:no significant|not statistically significant|non[- ]significant|did not|failed to|worsen|worse|inferior|favou?red placebo)\b/i
const SECONDARY_OR_SUBGROUP_POSITIVE = /\b(?:secondary (?:outcome|endpoint)|subgroup|sub-group|post[- ]hoc|exploratory (?:outcome|endpoint|analysis))[^.]{0,180}(?:significant|improv|reduc|benefit|favou?r|superior)\b/i

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function sourceEvidenceText(source: Record<string, unknown>, cache: ResearchQualityAnalysis['cache']): string {
  const pmid = text(source.pmid ?? source.pubmedId)
  const meta = pmid ? cache[pmid] ?? {} : {}
  return [
    source.title,
    source.note,
    source.citation,
    source.result,
    source.results,
    source.effect,
    meta.title,
    meta.abstract,
  ].map(text).filter(Boolean).join(' · ')
}

function isOutcomeClaim(claim: ResearchClaim): boolean {
  return /supports_outcome|benefit|efficacy/i.test(text(claim.predicate))
}

function favorableClaimDirection(claim: ResearchClaim): boolean {
  const qualifiers = claim.qualifiers && typeof claim.qualifiers === 'object'
    ? claim.qualifiers as Record<string, unknown>
    : {}
  const direction = text(qualifiers.direction).toLowerCase()
  if (['+', 'positive', 'benefit', 'beneficial', 'improves', 'reduces'].includes(direction)) return true
  const claimText = [claim.claim, claim.notes].map(text).filter(Boolean).join(' · ')
  return /\b(improv|reduc|benefit|help|support|increase|decrease|better|relief|protect)\w*\b/i.test(claimText)
}

function uniformlyPositiveLanguage(claim: ResearchClaim): boolean {
  const claimText = [claim.claim, claim.notes].map(text).filter(Boolean).join(' · ')
  return /\b(consistently|reliably|clear benefit|well[- ]established|proven|robust(?: benefit| effect| evidence)?|strong(?:ly)? (?:improves?|reduces?|benefit))\b/i.test(claimText)
}

function hasExplicitDirectionalSignal(value: string): boolean {
  return POSITIVE.test(value)
    || NULL.test(value)
    || NEGATIVE.test(value)
    || MIXED.test(value)
    || PRIMARY_NULL_OR_NEGATIVE.test(value)
    || SECONDARY_OR_SUBGROUP_POSITIVE.test(value)
}

export function analyzeDirectionalConsistency(analysis: ResearchQualityAnalysis): DirectionalConsistencyReport {
  const claims: DirectionalConsistencyFinding[] = []
  let approvedOutcomeClaims = 0

  for (const { url, record } of analysis.profiles) {
    const sourcesById = sourceMap(record)
    for (const claim of approvedClaims(record)) {
      if (!isOutcomeClaim(claim)) continue
      approvedOutcomeClaims += 1
      const favorableClaim = favorableClaimDirection(claim)
      if (!favorableClaim) continue

      const humanSources = uniqueSourceRefs(claim)
        .map((id) => sourcesById.get(id))
        .filter((source): source is Record<string, unknown> => Boolean(source))
        .filter((source) => PRIMARY_HUMAN_STUDY_CLASSES.has(sourceStudyClass(source, analysis.cache)))
      if (!humanSources.length) continue

      const sourceTexts = humanSources.map((source) => sourceEvidenceText(source, analysis.cache)).filter(Boolean)
      if (!sourceTexts.length) continue
      const explicitDirectionalSourceCount = sourceTexts.filter(hasExplicitDirectionalSignal).length
      if (!explicitDirectionalSourceCount) continue

      const positiveSourceCount = sourceTexts.filter((value) => POSITIVE.test(value)).length
      const nullSourceCount = sourceTexts.filter((value) => NULL.test(value)).length
      const negativeSourceCount = sourceTexts.filter((value) => NEGATIVE.test(value)).length
      const mixedSourceCount = sourceTexts.filter((value) => MIXED.test(value)).length
      const primaryNullOrNegativeSourceCount = sourceTexts.filter((value) => PRIMARY_NULL_OR_NEGATIVE.test(value)).length
      const secondaryOrSubgroupPositiveSourceCount = sourceTexts.filter((value) => SECONDARY_OR_SUBGROUP_POSITIVE.test(value)).length

      const endpointCherryPickRisk = sourceTexts.some((value) => PRIMARY_NULL_OR_NEGATIVE.test(value) && SECONDARY_OR_SUBGROUP_POSITIVE.test(value))
      const explicitCounterDirection = nullSourceCount + negativeSourceCount + mixedSourceCount
      const directionalHeterogeneity = explicitDirectionalSourceCount >= 2 && positiveSourceCount > 0 && explicitCounterDirection > 0
      const uniformlyPositiveOverstatement = directionalHeterogeneity && uniformlyPositiveLanguage(claim)

      const reasons: string[] = []
      if (endpointCherryPickRisk) {
        reasons.push(`${primaryNullOrNegativeSourceCount} linked human source(s) explicitly report a null/negative primary endpoint while a secondary, subgroup, post-hoc, or exploratory result is favorable`)
      }
      if (directionalHeterogeneity) {
        reasons.push(`linked human evidence is directionally mixed: ${positiveSourceCount} positive, ${nullSourceCount} null, ${negativeSourceCount} negative, ${mixedSourceCount} explicitly mixed source(s)`)
      }
      if (uniformlyPositiveOverstatement) {
        reasons.push('claim uses uniformly positive/reliable wording despite explicit directional heterogeneity in linked human evidence')
      }

      claims.push({
        url,
        claimId: text(claim.id) || 'unknown-claim',
        predicate: text(claim.predicate),
        confidence: Number(claim.confidence ?? 0),
        favorableClaim,
        humanSourceCount: humanSources.length,
        positiveSourceCount,
        nullSourceCount,
        negativeSourceCount,
        mixedSourceCount,
        primaryNullOrNegativeSourceCount,
        secondaryOrSubgroupPositiveSourceCount,
        endpointCherryPickRisk,
        directionalHeterogeneity,
        uniformlyPositiveOverstatement,
        reasons,
      })
    }
  }

  claims.sort((a, b) =>
    Number(b.uniformlyPositiveOverstatement) - Number(a.uniformlyPositiveOverstatement)
    || Number(b.endpointCherryPickRisk) - Number(a.endpointCherryPickRisk)
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const findings = claims.filter((claim) => claim.endpointCherryPickRisk || claim.directionalHeterogeneity)
  const highConfidenceFindings = findings.filter((claim) => claim.confidence >= 0.75)

  return {
    summary: {
      approvedOutcomeClaims,
      assessableClaims: claims.length,
      findings: findings.length,
      highConfidenceFindings: highConfidenceFindings.length,
      endpointCherryPickRisks: findings.filter((claim) => claim.endpointCherryPickRisk).length,
      directionalHeterogeneityClaims: findings.filter((claim) => claim.directionalHeterogeneity).length,
      uniformlyPositiveOverstatements: findings.filter((claim) => claim.uniformlyPositiveOverstatement).length,
    },
    claims,
    findings,
    highConfidenceFindings,
  }
}
