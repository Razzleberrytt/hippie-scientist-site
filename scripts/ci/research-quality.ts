#!/usr/bin/env npx tsx
/** Canonical one-pass research-quality pipeline and unified roll-up. */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { buildAiCitationReadiness, writeAiCitationReadinessReport } from '../../lib/ai-citation-readiness'
import { analyzeCitationIntegrity, writeCitationIntegrityReport } from '../../lib/citation-integrity.mjs'
import { analyzeEvidenceGradeConsistency, writeEvidenceGradeConsistencyReport } from '../../lib/evidence-grade-consistency'
import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import { buildResearchGapQueue, structuralCoverageFailures } from '../../lib/research-quality-policy'
import { buildResearchQualityTopology } from '../../lib/research-quality-topology'
import {
  analyzeResearchSemanticAlignment,
  writeResearchSemanticAlignmentReport,
} from '../../lib/research-semantic-alignment'
import { analyzeResearchSourceIntegrity } from '../../lib/research-source-integrity'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORT_DIR, 'research-quality.json')

const externalChecks = [
  { id: 'content-integrity', label: 'Structured content integrity', command: process.execPath, args: ['scripts/ci/audit-content-integrity.mjs'] },
] as const

type CheckResult = { id: string; label: string; passed: boolean; exitCode: number; durationMs: number; stdoutTail: string; stderrTail: string }
function tail(value: string, maxLines = 24): string { return value.split(/\r?\n/).filter(Boolean).slice(-maxLines).join('\n') }
function readSummary(fileName: string): unknown {
  const file = path.join(REPORT_DIR, fileName)
  if (!fs.existsSync(file)) return null
  try { return JSON.parse(fs.readFileSync(file, 'utf8')).summary ?? null } catch { return null }
}

const results: CheckResult[] = []
let failed = false
console.log('\nCanonical research-quality pipeline')
console.log('='.repeat(76))

const coreStarted = Date.now()
const analysis = analyzeResearchQuality(ROOT)
const topology = buildResearchQualityTopology(analysis)
const structuralFailures = structuralCoverageFailures(analysis)
const researchGapQueue = buildResearchGapQueue(analysis, topology)
const sourceIntegrity = analyzeResearchSourceIntegrity(analysis)
const semanticAlignment = analyzeResearchSemanticAlignment(analysis)
const semanticReportPath = writeResearchSemanticAlignmentReport(semanticAlignment, ROOT)
const citationIntegrity = analyzeCitationIntegrity(analysis.profiles)
const citationReportPath = writeCitationIntegrityReport(citationIntegrity, ROOT)
const evidenceGradeConsistency = analyzeEvidenceGradeConsistency(ROOT)
const evidenceGradeReportPath = writeEvidenceGradeConsistencyReport(evidenceGradeConsistency, ROOT)
const {
  crossProfileStudyLoad,
  systemicLoadBearingStudies,
  evidenceBundleReuse,
  narrowRepeatedEvidenceBundles,
  claimEvidenceOverlap,
  crossPredicateEvidenceOverlap,
  evidenceAgeSummary,
  legacyOnlyClaims,
  highConfidenceLegacyOnlyClaims,
  studyIdentityCoverage,
  edgeWeightedDesignUsage,
  edgeWeightedNarrativeDominatedProfiles,
  provenanceConcentration,
  provenanceConcentratedProfiles,
  studyClassConflicts,
} = topology
const aiCitationReadiness = buildAiCitationReadiness(analysis, ROOT)
const aiCitationReportPath = writeAiCitationReadinessReport(aiCitationReadiness, ROOT)
const weakApprovedOutcomes = analysis.claimAnalyses.filter((claim) => claim.outcomeClaim && ['unsupported', 'unclassified', 'narrative-only', 'indirect-only'].includes(claim.supportTier))
const unsupportedUnapprovedClaims = analysis.structuredClaimAnalyses.filter((claim) => !claim.approved && claim.supportTier === 'unsupported')
const weakUnapprovedOutcomes = analysis.structuredClaimAnalyses.filter((claim) => !claim.approved && claim.outcomeClaim && ['unsupported', 'unclassified', 'narrative-only', 'indirect-only'].includes(claim.supportTier))
const overDependentProfiles = analysis.profileAnalyses.filter((profile) => profile.overDependentOnSingleStudy)
const narrativeDominatedProfiles = analysis.profileAnalyses.filter((profile) => profile.narrativeDominatedVsPrimaryHuman)
const noPrimaryHumanProfiles = analysis.profileAnalyses.filter((profile) => profile.noPrimaryHuman)
const unmappedPrimaryHumanProfiles = analysis.profileAnalyses.filter((profile) => profile.unmappedPrimaryHuman > 0)
const unapprovedOnlyPrimaryHumanProfiles = analysis.profileAnalyses.filter((profile) => profile.unapprovedOnlyPrimaryHuman > 0)
const uncertainIdentityClaims = studyIdentityCoverage.claims.filter((claim) => claim.uncertainIndependence)
const weakIdentityProfiles = studyIdentityCoverage.profiles.filter((profile) => profile.weakIdentityCoverage || profile.uncertainMultiStudyClaimCount > 0)
const corePassed = structuralFailures.length === 0
  && sourceIntegrity.summary.withdrawn === 0
  && studyClassConflicts.summary.severeClassConflicts === 0
const coreDurationMs = Date.now() - coreStarted

results.push({
  id: 'canonical-core', label: 'Canonical claim/profile/source research-quality analysis', passed: corePassed,
  exitCode: corePassed ? 0 : 1, durationMs: coreDurationMs,
  stdoutTail: `profiles=${analysis.profileAnalyses.length}; approvedClaims=${analysis.claimAnalyses.length}; sourceStudies=${sourceIntegrity.summary.citedStudies}; gaps=${researchGapQueue.length}; systemicStudies=${systemicLoadBearingStudies.length}; narrowEvidenceBundles=${narrowRepeatedEvidenceBundles.length}; nearDuplicatePairs=${claimEvidenceOverlap.length}; edgeWeightedNarrative=${edgeWeightedNarrativeDominatedProfiles.length}; provenanceConcentrated=${provenanceConcentratedProfiles.length}; classConflicts=${studyClassConflicts.summary.studiesWithClassConflict}; severeClassConflicts=${studyClassConflicts.summary.severeClassConflicts}; identityUncertain=${studyIdentityCoverage.summary.uncertainMultiStudyClaims}; semanticMismatches=${semanticAlignment.summary.anyMismatch}; legacyOnly=${legacyOnlyClaims.length}; aiBelow70=${aiCitationReadiness.summary.below70}`,
  stderrTail: [
    structuralFailures.length ? `${structuralFailures.length} invalid evidence edge(s)` : '',
    sourceIntegrity.summary.withdrawn ? `${sourceIntegrity.summary.withdrawn} withdrawn/retracted citation(s)` : '',
    studyClassConflicts.summary.severeClassConflicts ? `${studyClassConflicts.summary.severeClassConflicts} severe canonical study-class conflict(s)` : '',
  ].filter(Boolean).join('; '),
})
console.log(`${corePassed ? 'PASS' : 'FAIL'}  Canonical claim/profile/source research-quality analysis  (${coreDurationMs}ms)`)
if (!corePassed) failed = true

results.push({
  id: 'citation-identities',
  label: 'Citation identity integrity',
  passed: citationIntegrity.passed,
  exitCode: citationIntegrity.passed ? 0 : 1,
  durationMs: 0,
  stdoutTail: `sources=${citationIntegrity.sources}; blocking=${citationIntegrity.blocking.length}; duplicateProfileRefs=${citationIntegrity.duplicateProfileSources.length}; pairConflicts=${citationIntegrity.identifierPairConflicts.length}; titleConflicts=${citationIntegrity.conflicts.length}`,
  stderrTail: citationIntegrity.passed ? '' : `${citationIntegrity.blockingCount} citation identity problem(s)`,
})
console.log(`${citationIntegrity.passed ? 'PASS' : 'FAIL'}  Citation identity integrity  (in-process)`)
if (!citationIntegrity.passed) failed = true

const gradesPassed = evidenceGradeConsistency.invalid.length === 0
results.push({
  id: 'evidence-grades',
  label: 'Evidence grade consistency',
  passed: gradesPassed,
  exitCode: gradesPassed ? 0 : 1,
  durationMs: 0,
  stdoutTail: `profiles=${evidenceGradeConsistency.totals.profiles}; flaggedIndexable=${evidenceGradeConsistency.totals.flaggedIndexable}; contradictions=${evidenceGradeConsistency.totals.contradictionsIndexable}`,
  stderrTail: gradesPassed ? '' : `${evidenceGradeConsistency.invalid.length} non-canonical published grade(s)`,
})
console.log(`${gradesPassed ? 'PASS' : 'FAIL'}  Evidence grade consistency  (in-process)`)
if (!gradesPassed) failed = true

for (const check of externalChecks) {
  const started = Date.now(); const run = spawnSync(check.command, check.args, { cwd: ROOT, encoding: 'utf8', env: process.env })
  const exitCode = run.status ?? 1; const passed = exitCode === 0; const durationMs = Date.now() - started
  const stdout = String(run.stdout ?? ''); const stderr = String(run.stderr ?? '')
  results.push({ id: check.id, label: check.label, passed, exitCode, durationMs, stdoutTail: tail(stdout), stderrTail: tail(stderr) })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${check.label}  (${durationMs}ms)`)
  if (!passed) { failed = true; const detail = tail(stderr || stdout, 10); if (detail) console.error(detail) }
}

const coreSummary = {
  profiles: analysis.profileAnalyses.length, structuredClaims: analysis.structuredClaimAnalyses.length, approvedClaims: analysis.claimAnalyses.length,
  structuralFailures: structuralFailures.length, withdrawnCitedStudies: sourceIntegrity.summary.withdrawn,
  severeStudyClassConflicts: studyClassConflicts.summary.severeClassConflicts,
  citationIntegrityProblems: citationIntegrity.blockingCount,
  semanticAlignment: semanticAlignment.summary,
  weakApprovedOutcomeClaims: weakApprovedOutcomes.length, unsupportedUnapprovedStructuredClaims: unsupportedUnapprovedClaims.length,
  weakUnapprovedOutcomeClaims: weakUnapprovedOutcomes.length, overDependentProfiles: overDependentProfiles.length,
  narrativeDominatedProfiles: narrativeDominatedProfiles.length, edgeWeightedNarrativeDominatedProfiles: edgeWeightedNarrativeDominatedProfiles.length,
  provenanceConcentratedProfiles: provenanceConcentratedProfiles.length,
  profilesWithApprovedClaimsButNoPrimaryHumanStudy: noPrimaryHumanProfiles.length,
  profilesWithUnmappedPrimaryHumanEvidence: unmappedPrimaryHumanProfiles.length,
  profilesWithPrimaryHumanEvidenceOnlyOnUnapprovedClaims: unapprovedOnlyPrimaryHumanProfiles.length,
  profilesWithResearchGaps: researchGapQueue.length, canonicalStudiesSupportingApprovedClaims: crossProfileStudyLoad.length,
  systemicLoadBearingStudies: systemicLoadBearingStudies.length, repeatedEvidenceBundles: evidenceBundleReuse.length,
  narrowRepeatedEvidenceBundles: narrowRepeatedEvidenceBundles.length, nearDuplicateEvidencePairs: claimEvidenceOverlap.length,
  crossPredicateNearDuplicateEvidencePairs: crossPredicateEvidenceOverlap.length,
  studyIdentityCoverage: studyIdentityCoverage.summary,
  provenanceConcentration: provenanceConcentration.summary,
  studyClassConflicts: studyClassConflicts.summary,
  sourceIntegrity: sourceIntegrity.summary,
  evidenceGradeConsistency: evidenceGradeConsistency.totals, evidenceAge: evidenceAgeSummary, aiCitationReadiness: aiCitationReadiness.summary,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
  schemaVersion: 17, generatedAt: new Date().toISOString(), passed: !failed,
  source: { analysis: 'lib/research-quality-analysis.ts', topology: 'lib/research-quality-topology.ts', policy: 'lib/research-quality-policy.ts', semanticAlignment: 'lib/research-semantic-alignment.ts', studyClassConflicts: 'lib/research-study-class-conflicts.ts', designUsage: 'lib/research-design-usage.ts', provenanceConcentration: 'lib/research-provenance-concentration.ts', studyIdentityCoverage: 'lib/research-study-identity-coverage.ts', citationIntegrity: 'lib/citation-integrity.mjs', sourceIntegrity: 'lib/research-source-integrity.ts', evidenceGradeConsistency: 'lib/evidence-grade-consistency.ts', aiCitationReadiness: 'lib/ai-citation-readiness.ts' },
  coreSummary, structuralFailures,
  studyClassConflicts: studyClassConflicts.conflicts.slice(0, 150), severeStudyClassConflicts: studyClassConflicts.severeConflicts.slice(0, 100),
  citationIntegrity: { blocking: citationIntegrity.blocking, duplicateProfileSources: citationIntegrity.duplicateProfileSources, identifierPairConflicts: citationIntegrity.identifierPairConflicts, conflicts: citationIntegrity.conflicts, missingCounts: citationIntegrity.missingCounts },
  semanticAlignment: { summary: semanticAlignment.summary, highConfidenceMismatches: semanticAlignment.highConfidenceMismatches.slice(0, 100), findings: semanticAlignment.findings.slice(0, 200) },
  withdrawnCitedStudies: sourceIntegrity.withdrawn, evidenceGradeInvalid: evidenceGradeConsistency.invalid, evidenceGradeContradictions: evidenceGradeConsistency.contradictions.slice(0, 100),
  oldAndLoadBearingStudies: sourceIntegrity.oldAndLoadBearing.slice(0, 100), systemicLoadBearingStudies: systemicLoadBearingStudies.slice(0, 50),
  topCrossProfileStudyLoad: crossProfileStudyLoad.slice(0, 100), narrowRepeatedEvidenceBundles: narrowRepeatedEvidenceBundles.slice(0, 100),
  topRepeatedEvidenceBundles: evidenceBundleReuse.slice(0, 100), topClaimEvidenceOverlap: claimEvidenceOverlap.slice(0, 150),
  edgeWeightedNarrativeDominatedProfiles: edgeWeightedNarrativeDominatedProfiles.slice(0, 100), topEdgeWeightedDesignUsage: edgeWeightedDesignUsage.slice(0, 150),
  provenanceConcentratedProfiles: provenanceConcentratedProfiles.slice(0, 100), topProvenanceConcentration: provenanceConcentration.profiles.slice(0, 150),
  uncertainStudyIdentityClaims: uncertainIdentityClaims.slice(0, 100), weakStudyIdentityCoverageProfiles: weakIdentityProfiles.slice(0, 100),
  highConfidenceLegacyOnlyClaims: highConfidenceLegacyOnlyClaims.slice(0, 100), topLegacyOnlyClaims: legacyOnlyClaims.slice(0, 100),
  topResearchGaps: researchGapQueue.slice(0, 50), topAiCitationRemediation: aiCitationReadiness.profiles.slice(0, 50),
  checks: results, contentIntegritySummary: readSummary('content-integrity.json'),
}, null, 2)}\n`)

console.log(`\nCore: ${coreSummary.profiles} profiles · ${coreSummary.structuredClaims} structured claims · ${coreSummary.approvedClaims} approved`)
console.log(`Citation integrity: ${citationIntegrity.sources} sources · ${citationIntegrity.blockingCount} blocking identity problems`)
console.log(`Source integrity: ${sourceIntegrity.summary.citedStudies} studies · ${sourceIntegrity.summary.withdrawn} withdrawn/concern · ${sourceIntegrity.summary.oldAndLoadBearing} old load-bearing`)
console.log(`Study classes: ${studyClassConflicts.summary.studiesWithClassConflict} canonical conflict(s) · ${studyClassConflicts.summary.severeClassConflicts} severe`)
console.log(`Evidence grades: ${evidenceGradeConsistency.totals.invalidPublishedGrades} invalid · ${evidenceGradeConsistency.totals.contradictionsIndexable} indexable contradictions`)
console.log(`Evidence topology: ${coreSummary.systemicLoadBearingStudies} systemic studies · ${coreSummary.narrowRepeatedEvidenceBundles} narrow repeated bundles · ${coreSummary.nearDuplicateEvidencePairs} near-duplicate claim pairs (${coreSummary.crossPredicateNearDuplicateEvidencePairs} cross-predicate) · ${evidenceAgeSummary.legacyOnly10Years} legacy-only claims`)
console.log(`Design usage: ${edgeWeightedNarrativeDominatedProfiles.length} profile(s) narrative-dominated by approved claim-study edges`)
console.log(`Provenance: ${provenanceConcentration.summary.provenanceConcentratedProfiles} concentrated profile(s) · ${provenanceConcentration.summary.firstAuthorConcentratedProfiles} first-author · ${provenanceConcentration.summary.journalConcentratedProfiles} journal`)
console.log(`Semantic alignment: ${semanticAlignment.summary.anyMismatch} explicit mismatch(es) · ${semanticAlignment.summary.highConfidenceMismatches} high-confidence · ${semanticAlignment.summary.roleMismatches} role · ${semanticAlignment.summary.domainMismatches} domain · ${semanticAlignment.summary.populationMismatches} population`)
console.log(`Study identity coverage: ${studyIdentityCoverage.summary.uncertainMultiStudyClaims} uncertain multi-study claim(s) · ${studyIdentityCoverage.summary.highConfidenceUncertainClaims} high-confidence · ${studyIdentityCoverage.summary.profilesWithWeakIdentityCoverage} weak-coverage profile(s)`)
console.log(`Mapping gaps: ${coreSummary.profilesWithUnmappedPrimaryHumanEvidence} profile(s) with unmapped primary-human evidence · ${coreSummary.profilesWithPrimaryHumanEvidenceOnlyOnUnapprovedClaims} with primary-human evidence only on unapproved claims`)
console.log(`AI citation remediation: ${aiCitationReadiness.summary.below70} below 70 · ${aiCitationReadiness.summary.contradictions} contradiction(s)`)
console.log(`Semantic report: ${path.relative(ROOT, semanticReportPath)}`)
console.log(`Citation report: ${path.relative(ROOT, citationReportPath)}`)
console.log(`Evidence-grade report: ${path.relative(ROOT, evidenceGradeReportPath)}`)
console.log(`AI report: ${path.relative(ROOT, aiCitationReportPath)}`)
console.log(`Roll-up report: ${path.relative(ROOT, REPORT_PATH)}`)
if (failed) { console.error('\n[research-quality] FAILED — one or more authoritative research checks failed.'); process.exit(1) }
console.log('\n[research-quality] PASS — one canonical analysis/topology/policy snapshot plus semantic alignment, citation/source integrity, evidence grades, and structured integrity agree.')
