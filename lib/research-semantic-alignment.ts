import fs from 'node:fs'
import path from 'node:path'

import {
  approvedClaims,
  sourceMap,
  uniqueSourceRefs,
  type PubmedCache,
  type ResearchClaim,
  type ResearchProfileEntry,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type EvidenceRole =
  | 'outcome'
  | 'safety'
  | 'interaction'
  | 'pregnancy'
  | 'mechanism'
  | 'pharmacokinetics'
  | 'evidence-quality'
  | 'unknown'

export type SemanticAlignmentFinding = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  claimRole: EvidenceRole
  sourceCount: number
  alignedSourceCount: number
  uncertainSourceCount: number
  explicitMismatchSourceCount: number
  comparableSourceCount: number
  semanticMetadataCoverage: number
  semanticCoverageGap: boolean
  semanticSupportShare: number | null
  semanticSingleSource: boolean
  semanticSupportConcentrated: boolean
  sourceRoles: EvidenceRole[]
  claimDomains: string[]
  sourceDomains: string[][]
  claimPopulations: string[]
  sourcePopulations: string[][]
  roleMismatch: boolean
  domainMismatch: boolean
  populationMismatch: boolean
  reasons: string[]
}

export type SemanticAlignmentReport = {
  generatedAt: string
  summary: {
    approvedClaims: number
    semanticallyAssessableClaims: number
    semanticallyComparableClaims: number
    fullySemanticallyAssessableClaims: number
    semanticCoverageGapClaims: number
    highConfidenceSemanticCoverageGaps: number
    roleMismatches: number
    domainMismatches: number
    populationMismatches: number
    anyMismatch: number
    highConfidenceMismatches: number
    semanticSingleSourceClaims: number
    semanticSupportConcentratedClaims: number
    highConfidenceSemanticConcentration: number
  }
  findings: SemanticAlignmentFinding[]
  highConfidenceMismatches: SemanticAlignmentFinding[]
  concentrationFindings: SemanticAlignmentFinding[]
  highConfidenceConcentrationFindings: SemanticAlignmentFinding[]
  coverageGapFindings: SemanticAlignmentFinding[]
  highConfidenceCoverageGapFindings: SemanticAlignmentFinding[]
}

const ROLE_PATTERNS: Array<[EvidenceRole, RegExp[]]> = [
  ['pregnancy', [/pregnan/i, /maternal/i, /fetal/i, /foetal/i, /lactat/i, /breast[- ]?feed/i]],
  ['interaction', [/drug interaction/i, /herb[- ]drug/i, /interaction with/i, /cytochrome p450/i, /\bcyp\d/i, /enzyme inhibit/i, /enzyme induc/i]],
  ['safety', [/safety/i, /adverse/i, /toxicit/i, /injur/i, /hepatotox/i, /liver injury/i, /side effect/i, /tolerab/i, /case report/i, /case series/i]],
  ['pharmacokinetics', [/pharmacokinetic/i, /bioavailab/i, /absorption/i, /metaboli[sz]m/i, /half[- ]?life/i]],
  ['mechanism', [/mechanism/i, /pathway/i, /receptor/i, /signali[sz]ing/i, /in vitro/i, /animal model/i, /mice/i, /mouse/i, /rat\b/i]],
  ['evidence-quality', [/systematic review/i, /meta-analysis/i, /evidence review/i, /risk of bias/i, /heterogene/i]],
  ['outcome', [/efficacy/i, /effect of/i, /effects of/i, /randomi[sz]ed/i, /clinical trial/i, /double[- ]blind/i, /placebo/i, /symptom/i, /improv/i, /treatment/i]],
]

const DOMAIN_PATTERNS: Record<string, RegExp[]> = {
  sleep: [/sleep/i, /insomnia/i],
  stress: [/stress/i, /cortisol/i],
  anxiety: [/anxi/i],
  depression: [/depress/i, /mood/i],
  cognition: [/cognit/i, /memory/i, /attention/i, /executive function/i],
  pain: [/pain/i, /analgesi/i],
  inflammation: [/inflamm/i, /cytokine/i],
  glucose: [/glucose/i, /glycemi/i, /diabet/i, /insulin/i],
  bloodPressure: [/blood pressure/i, /hypertension/i],
  lipids: [/cholesterol/i, /lipid/i, /triglyceride/i],
  thyroid: [/thyroid/i, /thyrotox/i],
  liver: [/liver/i, /hepatic/i, /hepatotox/i],
  exercise: [/exercise/i, /strength/i, /muscle/i, /performance/i],
  fertility: [/fertil/i, /sperm/i, /reproduct/i],
  weight: [/weight/i, /obes/i, /body mass/i],
}

const POPULATION_PATTERNS: Record<string, RegExp[]> = {
  pregnancy: [/pregnan/i, /maternal/i, /fetal/i, /foetal/i],
  children: [/child/i, /pediatric/i, /paediatric/i, /adolescen/i],
  olderAdults: [/older adult/i, /elderly/i, /geriatric/i],
  healthyAdults: [/healthy adult/i, /healthy volunteer/i],
  women: [/\bwomen\b/i, /\bfemale/i],
  men: [/\bmen\b/i, /\bmale/i],
}

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function intersects(a: string[], b: string[]): boolean {
  const right = new Set(b)
  return a.some((value) => right.has(value))
}

function cachedSource(source: Record<string, unknown>, cache: PubmedCache): Record<string, unknown> {
  const pmid = text(source.pmid ?? source.pubmedId)
  return pmid ? (cache[pmid] ?? {}) : {}
}

/**
 * Keep role classification anchored to concise bibliographic descriptors. Full
 * abstracts often mention adverse events or mechanisms incidentally and should
 * not turn an efficacy trial into a safety/mechanism source.
 */
function sourceRoleText(source: Record<string, unknown>, cache: PubmedCache): string {
  const cached = cachedSource(source, cache)
  return [source.title, cached.title, source.studyType, source.studyClass]
    .map(text)
    .filter(Boolean)
    .join(' · ')
}

/**
 * Domain/population comparability benefits from the richer canonical PubMed
 * context. Abstracts are descriptive context only; they do not determine role.
 */
function sourceSemanticText(source: Record<string, unknown>, cache: PubmedCache): string {
  const cached = cachedSource(source, cache)
  return [source.title, cached.title, cached.abstract, source.studyType, source.studyClass]
    .map(text)
    .filter(Boolean)
    .join(' · ')
}

function detectRole(value: string): EvidenceRole {
  for (const [role, patterns] of ROLE_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(value))) return role
  }
  return 'unknown'
}

function claimRole(claim: ResearchClaim): EvidenceRole {
  const predicate = text(claim.predicate).toLowerCase()
  const claimText = text(claim.claim)
  if (/safety|contraindication|warning/.test(predicate)) {
    if (/pregnan|lactat|breast[- ]?feed/i.test(claimText)) return 'pregnancy'
    if (/interact|cyp|sedative|medication|drug/i.test(claimText)) return 'interaction'
    return 'safety'
  }
  if (/interaction/.test(predicate)) return 'interaction'
  if (/mechanism/.test(predicate)) return 'mechanism'
  if (/pharmacokinetic|bioavailability/.test(predicate)) return 'pharmacokinetics'
  if (/supports_outcome|benefit|efficacy/.test(predicate)) {
    if (/evidence base|heterogene|risk[- ]?of[- ]bias|generaliz/i.test(claimText)) return 'evidence-quality'
    return 'outcome'
  }
  return detectRole(claimText)
}

function detectTags(value: string, patterns: Record<string, RegExp[]>): string[] {
  return Object.entries(patterns)
    .filter(([, tests]) => tests.some((pattern) => pattern.test(value)))
    .map(([tag]) => tag)
}

function compatibleRole(claim: EvidenceRole, source: EvidenceRole): boolean {
  if (claim === 'unknown' || source === 'unknown') return true
  if (claim === source) return true
  if (claim === 'outcome' && source === 'evidence-quality') return true
  if (claim === 'evidence-quality' && (source === 'outcome' || source === 'evidence-quality')) return true
  if (claim === 'pregnancy' && source === 'safety') return true
  if (claim === 'interaction' && (source === 'pharmacokinetics' || source === 'safety')) return true
  if (claim === 'safety' && (source === 'pregnancy' || source === 'interaction')) return true
  return false
}

function allExplicitlyDisjoint(claimTags: string[], sourceTags: string[][]): boolean {
  if (!claimTags.length || !sourceTags.length) return false
  if (sourceTags.some((tags) => tags.length === 0)) return false
  const claimSet = new Set(claimTags)
  return sourceTags.every((tags) => tags.every((tag) => !claimSet.has(tag)))
}

function classifySourceAlignment(
  role: EvidenceRole,
  claimDomains: string[],
  claimPopulations: string[],
  sourceRole: EvidenceRole,
  sourceDomains: string[],
  sourcePopulations: string[],
): 'aligned' | 'mismatch' | 'uncertain' {
  const roleKnown = role !== 'unknown' && sourceRole !== 'unknown'
  const roleMismatch = roleKnown && !compatibleRole(role, sourceRole)
  const roleAligned = roleKnown && compatibleRole(role, sourceRole)

  const domainComparable = claimDomains.length > 0 && sourceDomains.length > 0
  const domainMismatch = domainComparable && !intersects(claimDomains, sourceDomains)
  const domainAligned = domainComparable && intersects(claimDomains, sourceDomains)

  const populationComparable = claimPopulations.length > 0 && sourcePopulations.length > 0
  const populationMismatch = populationComparable && !intersects(claimPopulations, sourcePopulations)
  const populationAligned = populationComparable && intersects(claimPopulations, sourcePopulations)

  if (roleMismatch || domainMismatch || populationMismatch) return 'mismatch'
  if (roleAligned || domainAligned || populationAligned) return 'aligned'
  return 'uncertain'
}

function analyzeClaim(
  url: string,
  claim: ResearchClaim,
  record: ResearchProfileEntry['record'],
  cache: PubmedCache,
): SemanticAlignmentFinding | null {
  const sourcesById = sourceMap(record)
  const refs = uniqueSourceRefs(claim)
  const sources = refs.map((ref) => sourcesById.get(ref)).filter(Boolean) as Array<Record<string, unknown>>
  if (!sources.length) return null

  const claimText = text(claim.claim)
  const role = claimRole(claim)
  const sourceRoleTexts = sources.map((source) => sourceRoleText(source, cache))
  const sourceSemanticTexts = sources.map((source) => sourceSemanticText(source, cache))
  const sourceRoles = sourceRoleTexts.map(detectRole)
  const claimDomains = detectTags(claimText, DOMAIN_PATTERNS)
  const sourceDomains = sourceSemanticTexts.map((value) => detectTags(value, DOMAIN_PATTERNS))
  const claimPopulations = detectTags(claimText, POPULATION_PATTERNS)
  const sourcePopulations = sourceSemanticTexts.map((value) => detectTags(value, POPULATION_PATTERNS))

  const roleMismatch =
    role !== 'unknown' &&
    sourceRoles.every((sourceRole) => sourceRole !== 'unknown') &&
    sourceRoles.every((sourceRole) => !compatibleRole(role, sourceRole))
  const domainMismatch = allExplicitlyDisjoint(claimDomains, sourceDomains)
  const populationMismatch = allExplicitlyDisjoint(claimPopulations, sourcePopulations)

  const sourceAlignment = sourceRoles.map((sourceRole, index) => classifySourceAlignment(
    role,
    claimDomains,
    claimPopulations,
    sourceRole,
    sourceDomains[index],
    sourcePopulations[index],
  ))
  const alignedSourceCount = sourceAlignment.filter((status) => status === 'aligned').length
  const uncertainSourceCount = sourceAlignment.filter((status) => status === 'uncertain').length
  const explicitMismatchSourceCount = sourceAlignment.filter((status) => status === 'mismatch').length
  const comparableSourceCount = alignedSourceCount + explicitMismatchSourceCount
  const semanticMetadataCoverage = sources.length ? comparableSourceCount / sources.length : 0
  const semanticCoverageGap = semanticMetadataCoverage < 0.5
  const fullyAssessable = uncertainSourceCount === 0
  const semanticSupportShare = fullyAssessable && sources.length ? alignedSourceCount / sources.length : null
  const semanticSingleSource = fullyAssessable && sources.length >= 2 && alignedSourceCount === 1
  const semanticSupportConcentrated = fullyAssessable && sources.length >= 3 && alignedSourceCount > 0 && alignedSourceCount / sources.length <= 0.5

  const reasons: string[] = []
  if (roleMismatch) reasons.push(`claim role ${role} is not represented by linked source roles: ${unique(sourceRoles).join(', ')}`)
  if (domainMismatch) reasons.push(`claim domain ${claimDomains.join(', ')} is disjoint from explicit source domains`)
  if (populationMismatch) reasons.push(`claim population ${claimPopulations.join(', ')} is disjoint from explicit source populations`)
  if (semanticCoverageGap) reasons.push(`only ${comparableSourceCount} of ${sources.length} linked sources contain enough semantic metadata for alignment comparison`)
  if (semanticSingleSource) reasons.push(`only 1 of ${sources.length} explicitly assessable linked sources is semantically aligned`)
  else if (semanticSupportConcentrated) reasons.push(`${alignedSourceCount} of ${sources.length} explicitly assessable linked sources are semantically aligned`)

  return {
    url,
    claimId: text(claim.id) || 'unknown-claim',
    predicate: text(claim.predicate),
    confidence: Number(claim.confidence ?? 0),
    claimRole: role,
    sourceCount: sources.length,
    alignedSourceCount,
    uncertainSourceCount,
    explicitMismatchSourceCount,
    comparableSourceCount,
    semanticMetadataCoverage: Number(semanticMetadataCoverage.toFixed(3)),
    semanticCoverageGap,
    semanticSupportShare: semanticSupportShare === null ? null : Number(semanticSupportShare.toFixed(3)),
    semanticSingleSource,
    semanticSupportConcentrated,
    sourceRoles,
    claimDomains,
    sourceDomains,
    claimPopulations,
    sourcePopulations,
    roleMismatch,
    domainMismatch,
    populationMismatch,
    reasons,
  }
}

export function analyzeResearchSemanticAlignment(analysis: ResearchQualityAnalysis): SemanticAlignmentReport {
  const findings: SemanticAlignmentFinding[] = []
  const concentrationFindings: SemanticAlignmentFinding[] = []
  const coverageGapFindings: SemanticAlignmentFinding[] = []
  const analyzedFindings: SemanticAlignmentFinding[] = []
  let approvedClaimCount = 0

  for (const { url, record } of analysis.profiles) {
    const claims = approvedClaims(record)
    approvedClaimCount += claims.length
    for (const claim of claims) {
      const finding = analyzeClaim(url, claim, record, analysis.cache)
      if (!finding) continue
      analyzedFindings.push(finding)
      if (finding.roleMismatch || finding.domainMismatch || finding.populationMismatch) findings.push(finding)
      if (finding.semanticSingleSource || finding.semanticSupportConcentrated) concentrationFindings.push(finding)
      if (finding.semanticCoverageGap) coverageGapFindings.push(finding)
    }
  }

  const sorter = (a: SemanticAlignmentFinding, b: SemanticAlignmentFinding) =>
    Number(b.confidence) - Number(a.confidence) ||
    Number(b.semanticSingleSource) - Number(a.semanticSingleSource) ||
    Number(b.roleMismatch) - Number(a.roleMismatch) ||
    a.url.localeCompare(b.url) ||
    a.claimId.localeCompare(b.claimId)
  findings.sort(sorter)
  concentrationFindings.sort(sorter)
  coverageGapFindings.sort((a, b) =>
    a.semanticMetadataCoverage - b.semanticMetadataCoverage || sorter(a, b),
  )
  const highConfidenceMismatches = findings.filter((finding) => finding.confidence >= 0.75)
  const highConfidenceConcentrationFindings = concentrationFindings.filter((finding) => finding.confidence >= 0.75)
  const highConfidenceCoverageGapFindings = coverageGapFindings.filter((finding) => finding.confidence >= 0.75)

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      approvedClaims: approvedClaimCount,
      // Compatibility: claims with linked source rows that were analyzed at all.
      semanticallyAssessableClaims: analyzedFindings.length,
      semanticallyComparableClaims: analyzedFindings.filter((finding) => finding.comparableSourceCount > 0).length,
      fullySemanticallyAssessableClaims: analyzedFindings.filter((finding) => finding.uncertainSourceCount === 0).length,
      semanticCoverageGapClaims: coverageGapFindings.length,
      highConfidenceSemanticCoverageGaps: highConfidenceCoverageGapFindings.length,
      roleMismatches: findings.filter((finding) => finding.roleMismatch).length,
      domainMismatches: findings.filter((finding) => finding.domainMismatch).length,
      populationMismatches: findings.filter((finding) => finding.populationMismatch).length,
      anyMismatch: findings.length,
      highConfidenceMismatches: highConfidenceMismatches.length,
      semanticSingleSourceClaims: concentrationFindings.filter((finding) => finding.semanticSingleSource).length,
      semanticSupportConcentratedClaims: concentrationFindings.filter((finding) => finding.semanticSupportConcentrated).length,
      highConfidenceSemanticConcentration: highConfidenceConcentrationFindings.length,
    },
    findings,
    highConfidenceMismatches,
    concentrationFindings,
    highConfidenceConcentrationFindings,
    coverageGapFindings,
    highConfidenceCoverageGapFindings,
  }
}

export function writeResearchSemanticAlignmentReport(report: SemanticAlignmentReport, root = process.cwd()): string {
  const reportPath = path.join(root, 'ops', 'reports', 'research-semantic-alignment.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  return reportPath
}
