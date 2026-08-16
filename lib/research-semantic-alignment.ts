import fs from 'node:fs'
import path from 'node:path'

import {
  approvedClaims,
  sourceMap,
  uniqueSourceRefs,
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
    roleMismatches: number
    domainMismatches: number
    populationMismatches: number
    anyMismatch: number
    highConfidenceMismatches: number
  }
  findings: SemanticAlignmentFinding[]
  highConfidenceMismatches: SemanticAlignmentFinding[]
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

function sourceText(source: Record<string, unknown>): string {
  return [source.title, source.studyType, source.studyClass].map(text).filter(Boolean).join(' · ')
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
    if (/evidence base|heterogene|risk[- ]?of[- ]?bias|generaliz/i.test(claimText)) return 'evidence-quality'
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

function analyzeClaim(url: string, claim: ResearchClaim, record: ResearchProfileEntry['record']): SemanticAlignmentFinding | null {
  const sourcesById = sourceMap(record)
  const refs = uniqueSourceRefs(claim)
  const sources = refs.map((ref) => sourcesById.get(ref)).filter(Boolean) as Array<Record<string, unknown>>
  if (!sources.length) return null

  const claimText = text(claim.claim)
  const role = claimRole(claim)
  const sourceTexts = sources.map(sourceText)
  const sourceRoles = sourceTexts.map(detectRole)
  const claimDomains = detectTags(claimText, DOMAIN_PATTERNS)
  const sourceDomains = sourceTexts.map((value) => detectTags(value, DOMAIN_PATTERNS))
  const claimPopulations = detectTags(claimText, POPULATION_PATTERNS)
  const sourcePopulations = sourceTexts.map((value) => detectTags(value, POPULATION_PATTERNS))

  const roleMismatch =
    role !== 'unknown' &&
    sourceRoles.every((sourceRole) => sourceRole !== 'unknown') &&
    sourceRoles.every((sourceRole) => !compatibleRole(role, sourceRole))
  const domainMismatch = allExplicitlyDisjoint(claimDomains, sourceDomains)
  const populationMismatch = allExplicitlyDisjoint(claimPopulations, sourcePopulations)

  const reasons: string[] = []
  if (roleMismatch) reasons.push(`claim role ${role} is not represented by linked source roles: ${unique(sourceRoles).join(', ')}`)
  if (domainMismatch) reasons.push(`claim domain ${claimDomains.join(', ')} is disjoint from explicit source domains`)
  if (populationMismatch) reasons.push(`claim population ${claimPopulations.join(', ')} is disjoint from explicit source populations`)

  return {
    url,
    claimId: text(claim.id) || 'unknown-claim',
    predicate: text(claim.predicate),
    confidence: Number(claim.confidence ?? 0),
    claimRole: role,
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
  let approvedClaimCount = 0
  let assessable = 0

  for (const { url, record } of analysis.profiles) {
    const claims = approvedClaims(record)
    approvedClaimCount += claims.length
    for (const claim of claims) {
      const finding = analyzeClaim(url, claim, record)
      if (!finding) continue
      assessable += 1
      if (finding.roleMismatch || finding.domainMismatch || finding.populationMismatch) findings.push(finding)
    }
  }

  findings.sort((a, b) =>
    Number(b.confidence) - Number(a.confidence) ||
    Number(b.roleMismatch) - Number(a.roleMismatch) ||
    a.url.localeCompare(b.url) ||
    a.claimId.localeCompare(b.claimId),
  )
  const highConfidenceMismatches = findings.filter((finding) => finding.confidence >= 0.75)

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      approvedClaims: approvedClaimCount,
      semanticallyAssessableClaims: assessable,
      roleMismatches: findings.filter((finding) => finding.roleMismatch).length,
      domainMismatches: findings.filter((finding) => finding.domainMismatch).length,
      populationMismatches: findings.filter((finding) => finding.populationMismatch).length,
      anyMismatch: findings.length,
      highConfidenceMismatches: highConfidenceMismatches.length,
    },
    findings,
    highConfidenceMismatches,
  }
}

export function writeResearchSemanticAlignmentReport(report: SemanticAlignmentReport, root = process.cwd()): string {
  const reportPath = path.join(root, 'ops', 'reports', 'research-semantic-alignment.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  return reportPath
}
