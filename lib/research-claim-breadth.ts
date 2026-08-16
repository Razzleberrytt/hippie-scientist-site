import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  sourceMap,
  sourceStudyClass,
  uniqueSourceRefs,
  type PubmedCache,
  type ResearchClaim,
  type ResearchProfile,
  type ResearchSource,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type ClaimBreadthDimension = 'population' | 'dose' | 'duration' | 'formulation' | 'endpoint'

export type ClaimBreadthFinding = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  humanSourceCount: number
  comparableHumanSourceCount: number
  dimensions: ClaimBreadthDimension[]
  populationOverbroad: boolean
  doseOverbroad: boolean
  durationOverbroad: boolean
  formulationOverbroad: boolean
  endpointOverbroad: boolean
  reasons: string[]
}

export type ClaimBreadthAnalysis = {
  claims: ClaimBreadthFinding[]
  findings: ClaimBreadthFinding[]
  highConfidenceFindings: ClaimBreadthFinding[]
  summary: {
    approvedClaimsWithHumanEvidence: number
    assessableClaims: number
    overbroadClaims: number
    highConfidenceOverbroadClaims: number
    populationOverbroadClaims: number
    doseOverbroadClaims: number
    durationOverbroadClaims: number
    formulationOverbroadClaims: number
    endpointOverbroadClaims: number
  }
}

type NumericRange = { min: number; max: number; unit: string }

const POPULATION_PATTERNS: Record<string, RegExp[]> = {
  pregnancy: [/pregnan/i, /maternal/i, /gestation/i],
  children: [/child/i, /pediatric/i, /paediatric/i, /adolescen/i],
  olderAdults: [/older adult/i, /elderly/i, /geriatric/i, /aged\s+\d{2}/i],
  healthyAdults: [/healthy adult/i, /healthy volunteer/i],
  women: [/\bwomen\b/i, /\bfemale/i],
  men: [/\bmen\b/i, /\bmale/i],
  athletes: [/athlete/i, /trained/i, /sports/i],
}

const BROAD_POPULATION = /\b(adults?|people|humans?|general population|participants?|patients?)\b/i
const BROAD_FORMULATION = /\b(any|all|regardless of)\s+(form|forms|formulation|formulations|preparation|preparations)\b/i
const BROAD_ENDPOINT = /\b(overall symptoms?|general symptoms?|well[- ]?being|overall health|health outcomes?|multiple symptoms?)\b/i

const ENDPOINT_PATTERNS: Record<string, RegExp[]> = {
  sleep: [/sleep/i, /insomnia/i],
  anxiety: [/anxi/i],
  depression: [/depress/i, /mood/i],
  nausea: [/nausea/i, /vomit/i],
  pain: [/pain/i, /analgesi/i],
  glucose: [/glucose/i, /glycemi/i, /insulin/i],
  bloodPressure: [/blood pressure/i, /hypertension/i],
  lipids: [/cholesterol/i, /triglyceride/i, /lipid/i],
  cognition: [/cognit/i, /memory/i, /attention/i],
  exercise: [/strength/i, /exercise/i, /performance/i],
}

const FORMULATION_PATTERNS: Record<string, RegExp[]> = {
  extract: [/extract/i, /standardi[sz]ed/i],
  powder: [/powder/i, /ground/i],
  oil: [/\boil\b/i, /essential oil/i],
  tea: [/\btea\b/i, /infusion/i],
  capsule: [/capsule/i, /tablet/i],
  fresh: [/fresh/i, /raw/i],
}

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function tags(value: string, patterns: Record<string, RegExp[]>): string[] {
  return Object.entries(patterns)
    .filter(([, tests]) => tests.some((test) => test.test(value)))
    .map(([tag]) => tag)
}

function sourceCorpus(source: ResearchSource, cache: PubmedCache): string {
  const pmid = text(source.pmid ?? source.pubmedId)
  const cached = pmid ? cache[pmid] ?? {} : {}
  return [
    source.title,
    source.abstract,
    source.population,
    source.participants,
    source.dose,
    source.dosage,
    source.duration,
    source.formulation,
    source.preparation,
    cached.title,
    cached.abstract,
  ].map(text).filter(Boolean).join(' · ')
}

function qualifierText(claim: ResearchClaim, key: string): string {
  const qualifiers = claim.qualifiers
  if (!qualifiers || typeof qualifiers !== 'object') return ''
  return text((qualifiers as Record<string, unknown>)[key])
}

function parseRanges(value: string, duration = false): NumericRange[] {
  if (!value) return []
  const out: NumericRange[] = []
  const pattern = duration
    ? /(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?\s*(days?|weeks?|months?)/gi
    : /(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?\s*(mg|g|mcg|µg)(?:\s*\/\s*day)?/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(value))) {
    let min = Number(match[1])
    let max = Number(match[2] ?? match[1])
    let unit = match[3].toLowerCase()
    if (!duration) {
      if (unit === 'g') { min *= 1000; max *= 1000; unit = 'mg' }
      if (unit === 'mcg' || unit === 'µg') { min /= 1000; max /= 1000; unit = 'mg' }
    } else {
      if (unit.startsWith('week')) { min *= 7; max *= 7; unit = 'day' }
      else if (unit.startsWith('month')) { min *= 30; max *= 30; unit = 'day' }
      else unit = 'day'
    }
    out.push({ min: Math.min(min, max), max: Math.max(min, max), unit })
  }
  return out
}

function rangeExtendsBeyond(claimRanges: NumericRange[], sourceRanges: NumericRange[]): boolean {
  if (!claimRanges.length || !sourceRanges.length) return false
  const comparable = claimRanges.filter((claim) => sourceRanges.some((source) => source.unit === claim.unit))
  if (!comparable.length) return false
  return comparable.some((claim) => {
    const sources = sourceRanges.filter((source) => source.unit === claim.unit)
    const testedMin = Math.min(...sources.map((source) => source.min))
    const testedMax = Math.max(...sources.map((source) => source.max))
    return claim.min < testedMin || claim.max > testedMax
  })
}

function allSourcesExplicitlyNarrower(claimTags: string[], sourceTags: string[][]): boolean {
  if (!claimTags.length || !sourceTags.length || sourceTags.some((item) => item.length === 0)) return false
  const claimSet = new Set(claimTags)
  return sourceTags.every((item) => item.some((tag) => !claimSet.has(tag)))
}

function analyzeClaim(
  url: string,
  claim: ResearchClaim,
  record: ResearchProfile,
  cache: PubmedCache,
): ClaimBreadthFinding | null {
  const byId = sourceMap(record)
  const humanSources = uniqueSourceRefs(claim)
    .map((ref) => byId.get(ref))
    .filter((source): source is ResearchSource => Boolean(source))
    .filter((source) => PRIMARY_HUMAN_STUDY_CLASSES.has(sourceStudyClass(source, cache)))
  if (!humanSources.length) return null

  const corpora = humanSources.map((source) => sourceCorpus(source, cache))
  const claimText = [text(claim.claim), text(claim.notes)].filter(Boolean).join(' · ')
  const population = qualifierText(claim, 'population') || text(claim.population)
  const doseDuration = qualifierText(claim, 'dose_or_duration') || text(claim.dose_or_duration)
  const formulation = qualifierText(claim, 'formulation') || qualifierText(claim, 'preparation') || text(claim.formulation ?? claim.preparation)
  const endpoint = qualifierText(claim, 'endpoint') || qualifierText(claim, 'outcome') || claimText

  const sourcePopulations = corpora.map((value) => tags(value, POPULATION_PATTERNS))
  const sourceFormulations = corpora.map((value) => tags(value, FORMULATION_PATTERNS))
  const sourceEndpoints = corpora.map((value) => tags(value, ENDPOINT_PATTERNS))
  const claimPopulations = tags(population, POPULATION_PATTERNS)
  const claimFormulations = tags(formulation, FORMULATION_PATTERNS)
  const claimEndpoints = tags(endpoint, ENDPOINT_PATTERNS)

  const populationOverbroad = BROAD_POPULATION.test(population)
    && sourcePopulations.every((item) => item.length > 0)
    && unique(sourcePopulations.flat()).length > 0
  const formulationOverbroad = BROAD_FORMULATION.test(`${formulation} ${claimText}`)
    && sourceFormulations.every((item) => item.length > 0)
    && unique(sourceFormulations.flat()).length > 0
  const endpointOverbroad = BROAD_ENDPOINT.test(endpoint)
    && sourceEndpoints.every((item) => item.length > 0)
    && unique(sourceEndpoints.flat()).length > 0

  const claimDoseRanges = parseRanges(doseDuration, false)
  const sourceDoseRanges = corpora.flatMap((value) => parseRanges(value, false))
  const doseOverbroad = rangeExtendsBeyond(claimDoseRanges, sourceDoseRanges)
  const claimDurationRanges = parseRanges(doseDuration, true)
  const sourceDurationRanges = corpora.flatMap((value) => parseRanges(value, true))
  const durationOverbroad = rangeExtendsBeyond(claimDurationRanges, sourceDurationRanges)

  // Specific claim tags may also be broader than explicit linked-study tags.
  // This is intentionally conservative: every linked human source must expose
  // comparable metadata before a breadth finding is emitted.
  const specificPopulationBreadth = allSourcesExplicitlyNarrower(claimPopulations, sourcePopulations)
  const specificFormulationBreadth = allSourcesExplicitlyNarrower(claimFormulations, sourceFormulations)
  const specificEndpointBreadth = allSourcesExplicitlyNarrower(claimEndpoints, sourceEndpoints)

  const finalPopulation = populationOverbroad || specificPopulationBreadth
  const finalFormulation = formulationOverbroad || specificFormulationBreadth
  const finalEndpoint = endpointOverbroad || specificEndpointBreadth
  const dimensions = [
    finalPopulation ? 'population' : null,
    doseOverbroad ? 'dose' : null,
    durationOverbroad ? 'duration' : null,
    finalFormulation ? 'formulation' : null,
    finalEndpoint ? 'endpoint' : null,
  ].filter((value): value is ClaimBreadthDimension => Boolean(value))

  const reasons: string[] = []
  if (finalPopulation) reasons.push('claim population scope is broader than every comparable linked human study')
  if (doseOverbroad) reasons.push('claim dose scope extends outside the doses explicitly represented in linked human studies')
  if (durationOverbroad) reasons.push('claim duration scope extends outside the durations explicitly represented in linked human studies')
  if (finalFormulation) reasons.push('claim formulation scope is broader than every comparable linked human study')
  if (finalEndpoint) reasons.push('claim endpoint scope is broader than every comparable linked human study')

  const comparableHumanSourceCount = corpora.filter((value) =>
    tags(value, POPULATION_PATTERNS).length
    || tags(value, FORMULATION_PATTERNS).length
    || tags(value, ENDPOINT_PATTERNS).length
    || parseRanges(value, false).length
    || parseRanges(value, true).length,
  ).length

  return {
    url,
    claimId: text(claim.id) || 'unknown-claim',
    predicate: text(claim.predicate),
    confidence: Number(claim.confidence ?? 0),
    humanSourceCount: humanSources.length,
    comparableHumanSourceCount,
    dimensions,
    populationOverbroad: finalPopulation,
    doseOverbroad,
    durationOverbroad,
    formulationOverbroad: finalFormulation,
    endpointOverbroad: finalEndpoint,
    reasons,
  }
}

export function analyzeClaimBreadth(analysis: ResearchQualityAnalysis): ClaimBreadthAnalysis {
  const claims: ClaimBreadthFinding[] = []
  for (const { url, record } of analysis.profiles) {
    const rawClaims = Array.isArray(record.claimMap) ? record.claimMap : []
    for (const claim of rawClaims) {
      if (text(claim.reviewStatus).toLowerCase() !== 'approved') continue
      const result = analyzeClaim(url, claim, record, analysis.cache)
      if (result) claims.push(result)
    }
  }

  const findings = claims.filter((claim) => claim.dimensions.length > 0)
  findings.sort((a, b) =>
    Number(b.confidence >= 0.75) - Number(a.confidence >= 0.75)
    || b.dimensions.length - a.dimensions.length
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const highConfidenceFindings = findings.filter((claim) => claim.confidence >= 0.75)

  return {
    claims,
    findings,
    highConfidenceFindings,
    summary: {
      approvedClaimsWithHumanEvidence: claims.length,
      assessableClaims: claims.filter((claim) => claim.comparableHumanSourceCount > 0).length,
      overbroadClaims: findings.length,
      highConfidenceOverbroadClaims: highConfidenceFindings.length,
      populationOverbroadClaims: findings.filter((claim) => claim.populationOverbroad).length,
      doseOverbroadClaims: findings.filter((claim) => claim.doseOverbroad).length,
      durationOverbroadClaims: findings.filter((claim) => claim.durationOverbroad).length,
      formulationOverbroadClaims: findings.filter((claim) => claim.formulationOverbroad).length,
      endpointOverbroadClaims: findings.filter((claim) => claim.endpointOverbroad).length,
    },
  }
}
