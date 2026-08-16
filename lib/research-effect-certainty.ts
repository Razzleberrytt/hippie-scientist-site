import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  approvedClaims,
  sourceMap,
  sourceStudyClass,
  uniqueSourceRefs,
  type ResearchClaim,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type EffectCertaintyFinding = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  claimStrengthLanguage: boolean
  claimClinicalImportanceLanguage: boolean
  claimReliabilityLanguage: boolean
  humanSourceCount: number
  comparableHumanSourceCount: number
  smallOrModestSourceCount: number
  nullSourceCount: number
  mixedSourceCount: number
  clinicallyInsufficientSourceCount: number
  statisticalOnlySourceCount: number
  magnitudeOverstatement: boolean
  clinicalImportanceOverstatement: boolean
  certaintyOverstatement: boolean
  reasons: string[]
}

export type EffectCertaintyReport = {
  summary: {
    approvedOutcomeClaims: number
    assessableClaims: number
    findings: number
    highConfidenceFindings: number
    magnitudeOverstatements: number
    clinicalImportanceOverstatements: number
    certaintyOverstatements: number
  }
  claims: EffectCertaintyFinding[]
  findings: EffectCertaintyFinding[]
  highConfidenceFindings: EffectCertaintyFinding[]
}

const STRONG_MAGNITUDE = /\b(strong(?:ly)?|substantial(?:ly)?|marked(?:ly)?|dramatic(?:ally)?|robust(?:ly)?|large (?:effect|benefit|improvement|reduction)|major (?:effect|benefit|improvement|reduction)|significantly (?:improves?|reduces?|increases?|decreases?))\b/i
const CLINICAL_IMPORTANCE = /\b(clinically meaningful|clinically significant|meaningful (?:benefit|improvement|reduction)|important clinical benefit)\b/i
const RELIABILITY = /\b(reliabl(?:e|y)|consistently|consistent benefit|well[- ]established|proven|clear benefit|robust evidence)\b/i

const SMALL = /\b(small|modest|minimal|minor|slight) (?:effect|benefit|improvement|reduction|difference|change)\b/i
const NULL = /\b(no significant (?:difference|effect|benefit)|not statistically significant|non[- ]significant|did not (?:differ|improve|reduce)|no (?:difference|effect|benefit)|failed to (?:improve|reduce)|confidence interval[^.]{0,80}(?:included|crossed)[^.]{0,30}(?:zero|1\b|null))\b/i
const MIXED = /\b(mixed results?|inconsistent results?|inconsistent findings?|conflicting results?|heterogeneous results?|heterogeneity was (?:high|substantial)|not consistent across)\b/i
const CLINICALLY_INSUFFICIENT = /\b(not clinically significant|not clinically meaningful|below (?:the )?(?:minimal|minimum) clinically important difference|did not reach clinical significance|clinical significance was not reached)\b/i
const STATISTICAL_SIGNIFICANCE = /\b(statistically significant|significant difference|significantly (?:improved|reduced|increased|decreased))\b/i
const CLINICAL_SUPPORT = /\b(clinically meaningful|clinically significant|clinically important|minimal clinically important difference|minimum clinically important difference)\b/i

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

export function analyzeEffectCertainty(analysis: ResearchQualityAnalysis): EffectCertaintyReport {
  const claims: EffectCertaintyFinding[] = []
  let approvedOutcomeClaims = 0

  for (const { url, record } of analysis.profiles) {
    const sourcesById = sourceMap(record)
    for (const claim of approvedClaims(record)) {
      if (!isOutcomeClaim(claim)) continue
      approvedOutcomeClaims += 1

      const claimText = [claim.claim, claim.notes, claim.predicate].map(text).filter(Boolean).join(' · ')
      const claimStrengthLanguage = STRONG_MAGNITUDE.test(claimText)
      const claimClinicalImportanceLanguage = CLINICAL_IMPORTANCE.test(claimText)
      const claimReliabilityLanguage = RELIABILITY.test(claimText)
      if (!claimStrengthLanguage && !claimClinicalImportanceLanguage && !claimReliabilityLanguage) continue

      const humanSources = uniqueSourceRefs(claim)
        .map((id) => sourcesById.get(id))
        .filter((source): source is Record<string, unknown> => Boolean(source))
        .filter((source) => PRIMARY_HUMAN_STUDY_CLASSES.has(sourceStudyClass(source, analysis.cache)))

      if (!humanSources.length) continue
      const texts = humanSources.map((source) => sourceEvidenceText(source, analysis.cache))
      const comparable = texts.filter(Boolean)
      if (!comparable.length) continue

      const smallOrModestSourceCount = comparable.filter((value) => SMALL.test(value)).length
      const nullSourceCount = comparable.filter((value) => NULL.test(value)).length
      const mixedSourceCount = comparable.filter((value) => MIXED.test(value)).length
      const clinicallyInsufficientSourceCount = comparable.filter((value) => CLINICALLY_INSUFFICIENT.test(value)).length
      const statisticalOnlySourceCount = comparable.filter((value) => STATISTICAL_SIGNIFICANCE.test(value) && !CLINICAL_SUPPORT.test(value)).length

      const magnitudeCounterEvidence = smallOrModestSourceCount + nullSourceCount
      const magnitudeOverstatement = claimStrengthLanguage && magnitudeCounterEvidence > 0 && magnitudeCounterEvidence === comparable.length
      const clinicalImportanceOverstatement = claimClinicalImportanceLanguage && clinicallyInsufficientSourceCount > 0 && clinicallyInsufficientSourceCount === comparable.length
      const certaintyCounterEvidence = mixedSourceCount + nullSourceCount
      const certaintyOverstatement = claimReliabilityLanguage && certaintyCounterEvidence > 0 && certaintyCounterEvidence === comparable.length

      const reasons: string[] = []
      if (magnitudeOverstatement) reasons.push(`strong magnitude wording exceeds ${magnitudeCounterEvidence}/${comparable.length} linked human source(s) explicitly describing small/modest or null effects`)
      if (clinicalImportanceOverstatement) reasons.push(`clinical-importance wording conflicts with ${clinicallyInsufficientSourceCount}/${comparable.length} linked human source(s) explicitly saying clinical significance/meaningfulness was not reached`)
      if (certaintyOverstatement) reasons.push(`reliability wording exceeds ${certaintyCounterEvidence}/${comparable.length} linked human source(s) explicitly reporting mixed or null results`)
      if (!reasons.length && claimClinicalImportanceLanguage && statisticalOnlySourceCount === comparable.length) {
        reasons.push(`clinical-importance wording is supported only by statistical-significance language; clinical importance is not established in linked human source text`)
      }

      const statisticalOnlyClinicalOverreach = claimClinicalImportanceLanguage
        && clinicallyInsufficientSourceCount === 0
        && statisticalOnlySourceCount === comparable.length

      claims.push({
        url,
        claimId: text(claim.id) || 'unknown-claim',
        predicate: text(claim.predicate),
        confidence: Number(claim.confidence ?? 0),
        claimStrengthLanguage,
        claimClinicalImportanceLanguage,
        claimReliabilityLanguage,
        humanSourceCount: humanSources.length,
        comparableHumanSourceCount: comparable.length,
        smallOrModestSourceCount,
        nullSourceCount,
        mixedSourceCount,
        clinicallyInsufficientSourceCount,
        statisticalOnlySourceCount,
        magnitudeOverstatement,
        clinicalImportanceOverstatement: clinicalImportanceOverstatement || statisticalOnlyClinicalOverreach,
        certaintyOverstatement,
        reasons,
      })
    }
  }

  const findings = claims.filter((claim) => claim.magnitudeOverstatement || claim.clinicalImportanceOverstatement || claim.certaintyOverstatement)
    .sort((a, b) => b.confidence - a.confidence || a.url.localeCompare(b.url) || a.claimId.localeCompare(b.claimId))
  const highConfidenceFindings = findings.filter((claim) => claim.confidence >= 0.75)

  return {
    summary: {
      approvedOutcomeClaims,
      assessableClaims: claims.length,
      findings: findings.length,
      highConfidenceFindings: highConfidenceFindings.length,
      magnitudeOverstatements: findings.filter((claim) => claim.magnitudeOverstatement).length,
      clinicalImportanceOverstatements: findings.filter((claim) => claim.clinicalImportanceOverstatement).length,
      certaintyOverstatements: findings.filter((claim) => claim.certaintyOverstatement).length,
    },
    claims,
    findings,
    highConfidenceFindings,
  }
}
