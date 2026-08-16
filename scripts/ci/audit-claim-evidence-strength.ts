#!/usr/bin/env npx tsx
/**
 * Claim-level evidence strength audit.
 *
 * Profile-wide bibliographies can hide weak local support. This audit evaluates
 * each approved structured claim using only the sources explicitly linked to
 * that claim, then reports outcome claims that lack primary human research or
 * evidence synthesis.
 */

import fs from 'node:fs'
import path from 'node:path'

import { normalizeStudyClass, strongestStudyClass, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'claim-evidence-strength.json')

const PRIMARY_HUMAN = new Set<StudyClass>(['rct', 'controlled-trial', 'uncontrolled-trial'])
const SYNTHESIS = new Set<StudyClass>(['meta-analysis', 'systematic-review'])
const NARRATIVE = new Set<StudyClass>(['narrative-review'])

function loadCache(): Record<string, Record<string, unknown>> {
  if (!fs.existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')).records ?? {}
  } catch {
    return {}
  }
}

function designFromPublicationTypes(publicationTypes: string[] = []): StudyClass {
  const classes = publicationTypes
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

function sourceDesign(source: Record<string, unknown>, cache: Record<string, Record<string, unknown>>): StudyClass {
  const explicit = normalizeStudyClass(source.studyClass ?? source.studyType ?? '')
  if (explicit !== 'unclassified') return explicit
  const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
  const meta = (cache[pmid] ?? {}) as { publicationTypes?: string[] }
  return designFromPublicationTypes(meta.publicationTypes ?? [])
}

function profileFiles(): Array<{ kind: string; file: string }> {
  const files: Array<{ kind: string; file: string }> = []
  for (const [dir, kind] of [['herbs-detail', 'herbs'], ['compounds-detail', 'compounds']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (file.endsWith('.json')) files.push({ kind, file: path.join(full, file) })
    }
  }
  return files
}

const cache = loadCache()
const claims: Array<Record<string, unknown>> = []

for (const { kind, file } of profileFiles()) {
  let record: Record<string, unknown>
  try {
    record = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    continue
  }

  const slug = String(record.slug ?? path.basename(file, '.json'))
  const url = `/${kind}/${slug}/`
  const sources = Array.isArray(record.sources) ? record.sources as Array<Record<string, unknown>> : []
  const sourceById = new Map(sources.filter((source) => source.id).map((source) => [String(source.id), source]))
  const claimMap = Array.isArray(record.claimMap) ? record.claimMap as Array<Record<string, unknown>> : []

  for (const claim of claimMap) {
    if (String(claim.reviewStatus ?? '').toLowerCase() !== 'approved') continue
    const refs = [...new Set(Array.isArray(claim.sourceRefIds) ? claim.sourceRefIds.map(String).filter(Boolean) : [])]
    const designs = refs
      .map((ref) => sourceById.get(ref))
      .filter(Boolean)
      .map((source) => sourceDesign(source!, cache))
    const classified = designs.filter((design) => design !== 'unclassified')
    const primaryHuman = classified.filter((design) => PRIMARY_HUMAN.has(design)).length
    const synthesis = classified.filter((design) => SYNTHESIS.has(design)).length
    const narrative = classified.filter((design) => NARRATIVE.has(design)).length
    const predicate = String(claim.predicate ?? '')
    const outcomeClaim = predicate === 'supports_outcome'
    const confidence = Number(claim.confidence ?? 0)
    const strongHumanSupport = primaryHuman + synthesis > 0

    claims.push({
      url,
      claimId: String(claim.id ?? 'unknown-claim'),
      predicate,
      confidence,
      sourceCount: refs.length,
      classifiedSourceCount: classified.length,
      primaryHuman,
      synthesis,
      narrative,
      designs,
      outcomeClaim,
      noClassifiedEvidence: refs.length > 0 && classified.length === 0,
      narrativeOnlyOutcomeClaim: outcomeClaim && classified.length > 0 && narrative === classified.length,
      outcomeWithoutPrimaryOrSynthesis: outcomeClaim && classified.length > 0 && !strongHumanSupport,
      highConfidenceWeakOutcome: outcomeClaim && confidence >= 0.75 && !strongHumanSupport,
    })
  }
}

const noClassifiedEvidence = claims.filter((claim) => claim.noClassifiedEvidence)
const narrativeOnlyOutcomeClaims = claims.filter((claim) => claim.narrativeOnlyOutcomeClaim)
const outcomeWithoutPrimaryOrSynthesis = claims.filter((claim) => claim.outcomeWithoutPrimaryOrSynthesis)
const highConfidenceWeakOutcome = claims.filter((claim) => claim.highConfidenceWeakOutcome)

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    approvedClaims: claims.length,
    outcomeClaims: claims.filter((claim) => claim.outcomeClaim).length,
    noClassifiedEvidence: noClassifiedEvidence.length,
    narrativeOnlyOutcomeClaims: narrativeOnlyOutcomeClaims.length,
    outcomeWithoutPrimaryOrSynthesis: outcomeWithoutPrimaryOrSynthesis.length,
    highConfidenceWeakOutcome: highConfidenceWeakOutcome.length,
  },
  noClassifiedEvidence,
  narrativeOnlyOutcomeClaims,
  outcomeWithoutPrimaryOrSynthesis,
  highConfidenceWeakOutcome,
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

console.log('\nClaim-level evidence strength')
console.log('='.repeat(72))
console.log(`Approved claims                    ${report.summary.approvedClaims}`)
console.log(`Outcome claims                     ${report.summary.outcomeClaims}`)
console.log(`No classified linked evidence     ${report.summary.noClassifiedEvidence}`)
console.log(`Narrative-review-only outcomes     ${report.summary.narrativeOnlyOutcomeClaims}`)
console.log(`Outcomes without primary/synthesis ${report.summary.outcomeWithoutPrimaryOrSynthesis}`)
console.log(`High-confidence weak outcomes      ${report.summary.highConfidenceWeakOutcome}`)
console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
