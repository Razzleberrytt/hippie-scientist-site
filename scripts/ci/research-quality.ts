#!/usr/bin/env npx tsx
/** Canonical one-pass research-quality pipeline and unified roll-up. */

import fs from 'node:fs'
import path from 'node:path'

import { buildAiCitationReadiness, writeAiCitationReadinessReport } from '../../lib/ai-citation-readiness'
import { writeCitationIntegrityReport } from '../../lib/citation-integrity.mjs'
import { analyzeContentIntegrity, writeContentIntegrityReport } from '../../lib/content-integrity.mjs'
import { writeEvidenceGradeConsistencyReport } from '../../lib/evidence-grade-consistency'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'
import { writeResearchSemanticAlignmentReport } from '../../lib/research-semantic-alignment'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORT_DIR, 'research-quality.json')

type CheckResult = {
  id: string
  label: string
  passed: boolean
  exitCode: number
  durationMs: number
  stdoutTail: string
  stderrTail: string
}

const results: CheckResult[] = []
let failed = false
console.log('\nCanonical research-quality pipeline')
console.log('='.repeat(76))

const coreStarted = Date.now()
const snapshot = buildResearchQualitySnapshot(ROOT)
const { analysis, topology, gate, researchGapQueue, sourceIntegrity, citationIntegrity, evidenceGradeConsistency } = snapshot
const aiCitationReadiness = buildAiCitationReadiness(analysis, ROOT)

const {
  semanticAlignment,
  claimBreadth,
  effectCertainty,
  directionalConsistency,
  claimLanguageCalibration: languageCalibration,
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
  claimEvidenceDiversity,
  homogeneousMultiStudyClaims,
  highConfidenceHomogeneousMultiStudyClaims,
  claimProvenanceIndependence,
  provenanceNarrowMultiStudyClaims,
  highConfidenceProvenanceNarrowMultiStudyClaims,
  trialRegistrationIndependence,
  evidenceLineage,
  evidenceIndependenceCoverage,
  underlyingStudyIndependence,
  studyClassConflicts,
  crossProfileEvidenceBundles,
  narrowCrossProfileEvidenceBundles,
  claimCitationMetadata,
  edgeCardinality,
} = topology

const semanticReportPath = writeResearchSemanticAlignmentReport(semanticAlignment, ROOT)
const citationReportPath = writeCitationIntegrityReport(citationIntegrity, ROOT)
const evidenceGradeReportPath = writeEvidenceGradeConsistencyReport(evidenceGradeConsistency, ROOT)
const aiCitationReportPath = writeAiCitationReadinessReport(aiCitationReadiness, ROOT)
const contentIntegrityStarted = Date.now()
const contentIntegrity = analyzeContentIntegrity(ROOT)
const contentIntegrityReportPath = writeContentIntegrityReport(contentIntegrity, ROOT)
const contentIntegrityDurationMs = Date.now() - contentIntegrityStarted
results.push({
  id: 'content-integrity',
  label: 'Structured content integrity',
  passed: true,
  exitCode: 0,
  durationMs: contentIntegrityDurationMs,
  stdoutTail: `profiles=${contentIntegrity.summary.profiles}; indexable=${contentIntegrity.summary.indexable}; duplicateCandidates=${contentIntegrity.summary.duplicateCandidates.total}; mechanismAsOutcome=${contentIntegrity.summary.mechanismAsOutcome.total}`,
  stderrTail: '',
})

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
const corePassed = gate.passed && sourceIntegrity.summary.withdrawn === 0
const coreDurationMs = Date.now() - coreStarted

results.unshift({
  id: 'canonical-core',
  label: 'Canonical claim/profile/source research-quality analysis',
  passed: corePassed,
  exitCode: corePassed ? 0 : 1,
  durationMs: coreDurationMs,
  stdoutTail: [
    `profiles=${analysis.profileAnalyses.length}`,
    `approvedClaims=${analysis.claimAnalyses.length}`,
    `sourceStudies=${sourceIntegrity.summary.citedStudies}`,
    `gaps=${researchGapQueue.length}`,
    `blocking=${gate.summary.blockingFailures}`,
    `semanticMismatches=${semanticAlignment.summary.anyMismatch}`,
    `claimBreadthOverreach=${claimBreadth.summary.overbroadClaims}`,
    `effectCertaintyOverreach=${effectCertainty.summary.findings}`,
    `directionalFindings=${directionalConsistency.summary.findings}`,
    `causalWithoutControlled=${languageCalibration.summary.causalWithoutControlledSupport}`,
    `pseudoMultiSource=${edgeCardinality.summary.pseudoMultiSourceClaims}`,
    `sameTrialReuse=${trialRegistrationIndependence.summary.sameTrialReuseClaims}`,
    `sharedLineage=${evidenceLineage.summary.sharedNonRegistryLineageClaims}`,
    `independenceUnresolved=${evidenceIndependenceCoverage.summary.unresolvedClaims}`,
    `underlyingStudyReduced=${underlyingStudyIndependence.summary.independenceReducedClaims}`,
    `newlyOverDependent=${underlyingStudyIndependence.summary.newlyOverDependentProfiles}`,
  ].join('; '),
  stderrTail: [
    gate.summary.structuralFailures ? `${gate.summary.structuralFailures} invalid evidence edge(s)` : '',
    gate.summary.severeStudyClassConflicts ? `${gate.summary.severeStudyClassConflicts} severe study-class conflict(s)` : '',
    sourceIntegrity.summary.withdrawn ? `${sourceIntegrity.summary.withdrawn} withdrawn/retracted citation(s)` : '',
  ].filter(Boolean).join('; '),
})
console.log(`${corePassed ? 'PASS' : 'FAIL'}  Canonical claim/profile/source research-quality analysis  (${coreDurationMs}ms)`)
if (!corePassed) failed = true

results.splice(1, 0, {
  id: 'citation-identities',
  label: 'Citation identity integrity',
  passed: citationIntegrity.passed,
  exitCode: citationIntegrity.passed ? 0 : 1,
  durationMs: 0,
  stdoutTail: `sources=${citationIntegrity.sources}; blocking=${citationIntegrity.blockingCount}`,
  stderrTail: citationIntegrity.passed ? '' : `${citationIntegrity.blockingCount} citation identity problem(s)`,
})
if (!citationIntegrity.passed) failed = true

const gradesPassed = evidenceGradeConsistency.invalid.length === 0
results.splice(2, 0, {
  id: 'evidence-grades',
  label: 'Evidence grade consistency',
  passed: gradesPassed,
  exitCode: gradesPassed ? 0 : 1,
  durationMs: 0,
  stdoutTail: `profiles=${evidenceGradeConsistency.totals.profiles}; contradictions=${evidenceGradeConsistency.totals.contradictionsIndexable}`,
  stderrTail: gradesPassed ? '' : `${evidenceGradeConsistency.invalid.length} non-canonical published grade(s)`,
})
if (!gradesPassed) failed = true

const coreSummary = {
  profiles: analysis.profileAnalyses.length,
  structuredClaims: analysis.structuredClaimAnalyses.length,
  approvedClaims: analysis.claimAnalyses.length,
  researchQualityGate: gate.summary,
  structuralFailures: gate.summary.structuralFailures,
  severeStudyClassConflicts: gate.summary.severeStudyClassConflicts,
  withdrawnCitedStudies: sourceIntegrity.summary.withdrawn,
  citationIntegrityProblems: citationIntegrity.blockingCount,
  semanticAlignment: semanticAlignment.summary,
  claimBreadth: claimBreadth.summary,
  effectCertainty: effectCertainty.summary,
  directionalConsistency: directionalConsistency.summary,
  claimLanguageCalibration: languageCalibration.summary,
  claimCitationMetadata: claimCitationMetadata.summary,
  edgeCardinality: edgeCardinality.summary,
  trialRegistrationIndependence: trialRegistrationIndependence.summary,
  evidenceLineage: evidenceLineage.summary,
  evidenceIndependenceCoverage: evidenceIndependenceCoverage.summary,
  underlyingStudyIndependence: underlyingStudyIndependence.summary,
  weakApprovedOutcomeClaims: weakApprovedOutcomes.length,
  unsupportedUnapprovedStructuredClaims: unsupportedUnapprovedClaims.length,
  weakUnapprovedOutcomeClaims: weakUnapprovedOutcomes.length,
  overDependentProfiles: overDependentProfiles.length,
  narrativeDominatedProfiles: narrativeDominatedProfiles.length,
  edgeWeightedNarrativeDominatedProfiles: edgeWeightedNarrativeDominatedProfiles.length,
  provenanceConcentratedProfiles: provenanceConcentratedProfiles.length,
  homogeneousMultiStudyClaims: homogeneousMultiStudyClaims.length,
  highConfidenceHomogeneousMultiStudyClaims: highConfidenceHomogeneousMultiStudyClaims.length,
  provenanceNarrowMultiStudyClaims: provenanceNarrowMultiStudyClaims.length,
  highConfidenceProvenanceNarrowMultiStudyClaims: highConfidenceProvenanceNarrowMultiStudyClaims.length,
  crossProfileEvidenceBundles: crossProfileEvidenceBundles.length,
  narrowCrossProfileEvidenceBundles: narrowCrossProfileEvidenceBundles.length,
  profilesWithApprovedClaimsButNoPrimaryHumanStudy: noPrimaryHumanProfiles.length,
  profilesWithUnmappedPrimaryHumanEvidence: unmappedPrimaryHumanProfiles.length,
  profilesWithPrimaryHumanEvidenceOnlyOnUnapprovedClaims: unapprovedOnlyPrimaryHumanProfiles.length,
  profilesWithResearchGaps: researchGapQueue.length,
  canonicalStudiesSupportingApprovedClaims: crossProfileStudyLoad.length,
  systemicLoadBearingStudies: systemicLoadBearingStudies.length,
  repeatedEvidenceBundles: evidenceBundleReuse.length,
  narrowRepeatedEvidenceBundles: narrowRepeatedEvidenceBundles.length,
  nearDuplicateEvidencePairs: claimEvidenceOverlap.length,
  crossPredicateNearDuplicateEvidencePairs: crossPredicateEvidenceOverlap.length,
  studyClassConflicts: studyClassConflicts.summary,
  studyIdentityCoverage: studyIdentityCoverage.summary,
  provenanceConcentration: provenanceConcentration.summary,
  sourceIntegrity: sourceIntegrity.summary,
  evidenceGradeConsistency: evidenceGradeConsistency.totals,
  evidenceAge: evidenceAgeSummary,
  aiCitationReadiness: aiCitationReadiness.summary,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
  schemaVersion: 28,
  generatedAt: new Date().toISOString(),
  passed: !failed,
  source: {
    snapshot: 'lib/research-quality-snapshot.ts',
    analysis: 'lib/research-quality-analysis.ts',
    topology: 'lib/research-quality-topology.ts',
    policy: 'lib/research-quality-policy.ts',
    gate: 'lib/research-quality-gate.ts',
    edgeCardinality: 'lib/research-edge-cardinality.ts',
    trialRegistrationIndependence: 'lib/research-trial-registration-independence.ts',
    evidenceLineage: 'lib/research-evidence-lineage.ts',
    evidenceIndependenceCoverage: 'lib/research-evidence-independence-coverage.ts',
    underlyingStudyIndependence: 'lib/research-underlying-study-independence.ts',
    claimBreadth: 'lib/research-claim-breadth.ts',
    effectCertainty: 'lib/research-effect-certainty.ts',
    directionalConsistency: 'lib/research-directional-consistency.ts',
  },
  coreSummary,
  structuralFailures: gate.structuralFailures,
  severeStudyClassConflicts: gate.severeStudyClassConflicts,
  studyClassConflicts: studyClassConflicts.conflicts.slice(0, 150),
  citationIntegrity: {
    blocking: citationIntegrity.blocking,
    duplicateProfileSources: citationIntegrity.duplicateProfileSources,
    identifierPairConflicts: citationIntegrity.identifierPairConflicts,
    conflicts: citationIntegrity.conflicts,
    missingCounts: citationIntegrity.missingCounts,
  },
  semanticAlignment: {
    summary: semanticAlignment.summary,
    highConfidenceMismatches: semanticAlignment.highConfidenceMismatches.slice(0, 100),
    highConfidenceConcentration: semanticAlignment.highConfidenceConcentrationFindings.slice(0, 100),
    highConfidenceCoverageGaps: semanticAlignment.highConfidenceCoverageGapFindings.slice(0, 100),
  },
  claimBreadth: {
    summary: claimBreadth.summary,
    findings: claimBreadth.findings.slice(0, 150),
    highConfidenceFindings: claimBreadth.highConfidenceFindings.slice(0, 100),
  },
  effectCertainty: {
    summary: effectCertainty.summary,
    findings: effectCertainty.findings.slice(0, 150),
    highConfidenceFindings: effectCertainty.highConfidenceFindings.slice(0, 100),
  },
  directionalConsistency: {
    summary: directionalConsistency.summary,
    findings: directionalConsistency.findings.slice(0, 150),
    highConfidenceFindings: directionalConsistency.highConfidenceFindings.slice(0, 100),
    assessableClaims: directionalConsistency.claims.slice(0, 200),
  },
  claimLanguageCalibration: {
    summary: languageCalibration.summary,
    highConfidenceFindings: languageCalibration.highConfidenceFindings.slice(0, 100),
    highConfidenceDirectEvidenceFindings: languageCalibration.highConfidenceDirectEvidenceFindings.slice(0, 100),
  },
  claimCitationMetadata: {
    summary: claimCitationMetadata.summary,
    highConfidenceLowCoverageClaims: claimCitationMetadata.highConfidenceLowCoverageClaims.slice(0, 100),
  },
  edgeCardinality: {
    summary: edgeCardinality.summary,
    pseudoMultiSourceClaims: edgeCardinality.pseudoMultiSourceClaims.slice(0, 150),
    aliasCollapsedClaims: edgeCardinality.aliasCollapsedClaims.slice(0, 150),
    duplicateEdgeClaims: edgeCardinality.duplicateEdgeClaims.slice(0, 100),
  },
  trialRegistrationIndependence: {
    summary: trialRegistrationIndependence.summary,
    sameTrialReuseClaims: trialRegistrationIndependence.sameTrialReuseClaims.slice(0, 150),
    highConfidenceSameTrialReuseClaims: trialRegistrationIndependence.highConfidenceSameTrialReuseClaims.slice(0, 100),
  },
  evidenceLineage: {
    summary: evidenceLineage.summary,
    sharedNonRegistryLineageClaims: evidenceLineage.sharedNonRegistryLineageClaims.slice(0, 150),
    highConfidenceSharedNonRegistryLineageClaims: evidenceLineage.highConfidenceSharedNonRegistryLineageClaims.slice(0, 100),
  },
  evidenceIndependenceCoverage: {
    summary: evidenceIndependenceCoverage.summary,
    unresolvedClaims: evidenceIndependenceCoverage.unresolvedClaims.slice(0, 150),
    highConfidenceUnresolvedClaims: evidenceIndependenceCoverage.highConfidenceUnresolvedClaims.slice(0, 100),
  },
  underlyingStudyIndependence: {
    summary: underlyingStudyIndependence.summary,
    reducedClaims: underlyingStudyIndependence.reducedClaims.slice(0, 150),
    pseudoMultiStudyClaims: underlyingStudyIndependence.pseudoMultiStudyClaims.slice(0, 150),
    highConfidencePseudoMultiStudyClaims: underlyingStudyIndependence.highConfidencePseudoMultiStudyClaims.slice(0, 100),
    supportTierDowngrades: underlyingStudyIndependence.supportTierDowngrades.slice(0, 150),
    newlyOverDependentProfiles: underlyingStudyIndependence.newlyOverDependentProfiles.slice(0, 100),
    profiles: underlyingStudyIndependence.profiles.slice(0, 150),
  },
  withdrawnCitedStudies: sourceIntegrity.withdrawn,
  evidenceGradeInvalid: evidenceGradeConsistency.invalid,
  evidenceGradeContradictions: evidenceGradeConsistency.contradictions.slice(0, 100),
  oldAndLoadBearingStudies: sourceIntegrity.oldAndLoadBearing.slice(0, 100),
  systemicLoadBearingStudies: systemicLoadBearingStudies.slice(0, 50),
  narrowRepeatedEvidenceBundles: narrowRepeatedEvidenceBundles.slice(0, 100),
  narrowCrossProfileEvidenceBundles: narrowCrossProfileEvidenceBundles.slice(0, 100),
  homogeneousMultiStudyClaims: homogeneousMultiStudyClaims.slice(0, 150),
  provenanceNarrowMultiStudyClaims: provenanceNarrowMultiStudyClaims.slice(0, 150),
  topClaimEvidenceDiversity: claimEvidenceDiversity.slice(0, 200),
  topClaimProvenanceIndependence: claimProvenanceIndependence.slice(0, 200),
  topClaimEvidenceOverlap: claimEvidenceOverlap.slice(0, 150),
  edgeWeightedNarrativeDominatedProfiles: edgeWeightedNarrativeDominatedProfiles.slice(0, 100),
  topEdgeWeightedDesignUsage: edgeWeightedDesignUsage.slice(0, 150),
  provenanceConcentratedProfiles: provenanceConcentratedProfiles.slice(0, 100),
  topProvenanceConcentration: provenanceConcentration.profiles.slice(0, 150),
  uncertainStudyIdentityClaims: uncertainIdentityClaims.slice(0, 100),
  weakStudyIdentityCoverageProfiles: weakIdentityProfiles.slice(0, 100),
  highConfidenceLegacyOnlyClaims: highConfidenceLegacyOnlyClaims.slice(0, 100),
  topLegacyOnlyClaims: legacyOnlyClaims.slice(0, 100),
  topResearchGaps: researchGapQueue.slice(0, 50),
  topAiCitationRemediation: aiCitationReadiness.profiles.slice(0, 50),
  checks: results,
  contentIntegritySummary: contentIntegrity.summary,
}, null, 2)}\n`)

console.log(`\nCore: ${coreSummary.profiles} profiles · ${coreSummary.structuredClaims} structured claims · ${coreSummary.approvedClaims} approved`)
console.log(`Research gate: ${gate.summary.blockingFailures} blocking · ${gate.summary.structuralFailures} structural · ${gate.summary.severeStudyClassConflicts} severe study-class conflict(s)`)
console.log(`Semantic alignment: ${semanticAlignment.summary.anyMismatch} explicit mismatch(es) · ${semanticAlignment.summary.highConfidenceMismatches} high-confidence`)
console.log(`Claim breadth: ${claimBreadth.summary.overbroadClaims} overbroad claim(s) · ${claimBreadth.summary.highConfidenceOverbroadClaims} high-confidence · population ${claimBreadth.summary.populationOverbroadClaims} · dose ${claimBreadth.summary.doseOverbroadClaims} · duration ${claimBreadth.summary.durationOverbroadClaims} · formulation ${claimBreadth.summary.formulationOverbroadClaims} · endpoint ${claimBreadth.summary.endpointOverbroadClaims}`)
console.log(`Effect/certainty: ${effectCertainty.summary.findings} overstatement finding(s) · ${effectCertainty.summary.highConfidenceFindings} high-confidence · magnitude ${effectCertainty.summary.magnitudeOverstatements} · clinical importance ${effectCertainty.summary.clinicalImportanceOverstatements} · certainty ${effectCertainty.summary.certaintyOverstatements}`)
console.log(`Directional consistency: ${directionalConsistency.summary.findings} finding(s) · ${directionalConsistency.summary.highConfidenceFindings} high-confidence · endpoint cherry-pick ${directionalConsistency.summary.endpointCherryPickRisks} · heterogeneous ${directionalConsistency.summary.directionalHeterogeneityClaims} · uniformly-positive overstatement ${directionalConsistency.summary.uniformlyPositiveOverstatements}`)
console.log(`Language calibration: ${languageCalibration.summary.causalWithoutControlledSupport} unsupported direct-causal claim(s)`)
console.log(`Edge cardinality: ${edgeCardinality.summary.pseudoMultiSourceClaims} pseudo-multi-source · ${edgeCardinality.summary.aliasCollapsedClaims} alias-collapsed · ${edgeCardinality.summary.duplicateEdges} duplicate edge(s)`)
console.log(`Underlying-study reuse: ${trialRegistrationIndependence.summary.sameTrialReuseClaims} same-trial claim(s) · ${evidenceLineage.summary.sharedNonRegistryLineageClaims} shared lineage claim(s)`)
console.log(`Underlying-study independence: ${underlyingStudyIndependence.summary.independenceReducedClaims} reduced claim(s) · ${underlyingStudyIndependence.summary.pseudoMultiStudyClaims} pseudo-multi-study · ${underlyingStudyIndependence.summary.supportTierDowngrades} support-tier downgrade(s) · ${underlyingStudyIndependence.summary.newlyOverDependentProfiles} newly overdependent profile(s)`)
console.log(`Independence coverage: ${evidenceIndependenceCoverage.summary.unresolvedClaims} unresolved multi-study claim(s) · ${evidenceIndependenceCoverage.summary.highConfidenceUnresolvedClaims} high-confidence · ${Math.round(evidenceIndependenceCoverage.summary.meanCombinedCoverage * 100)}% mean explicit coverage`)
console.log(`Gap queue: ${researchGapQueue.length} profile(s) prioritized`)
console.log(`Semantic report: ${path.relative(ROOT, semanticReportPath)}`)
console.log(`Citation report: ${path.relative(ROOT, citationReportPath)}`)
console.log(`Evidence-grade report: ${path.relative(ROOT, evidenceGradeReportPath)}`)
console.log(`AI report: ${path.relative(ROOT, aiCitationReportPath)}`)
console.log(`Content-integrity report: ${path.relative(ROOT, contentIntegrityReportPath)}`)
console.log(`Roll-up report: ${path.relative(ROOT, REPORT_PATH)}`)

if (failed) {
  console.error('\n[research-quality] FAILED — one or more authoritative research checks failed.')
  process.exit(1)
}
console.log('\n[research-quality] PASS — one canonical analysis/topology/policy/gate snapshot plus citation/source integrity, evidence grades, and structured integrity agree.')