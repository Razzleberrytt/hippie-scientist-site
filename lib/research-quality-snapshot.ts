import { analyzeCitationIntegrity } from './citation-integrity.mjs'
import { analyzeEvidenceGradeConsistency } from './evidence-grade-consistency'
import { analyzeResearchQuality, type ResearchQualityAnalysis } from './research-quality-analysis'
import { buildResearchQualityGate, type ResearchQualityGate } from './research-quality-gate'
import { buildCanonicalResearchGapQueue } from './research-quality-remediation'
import {
  validateResearchRemediationInvariants,
  type ResearchRemediationInvariantReport,
} from './research-quality-remediation-invariants'
import {
  validateResearchQualitySnapshotInvariants,
  type ResearchSnapshotInvariantReport,
} from './research-quality-snapshot-invariants'
import { buildResearchQualityTopology, type ResearchQualityTopology } from './research-quality-topology'
import { analyzeResearchSourceIntegrity } from './research-source-integrity'

export type ResearchQualitySnapshot = {
  analysis: ResearchQualityAnalysis
  topology: ResearchQualityTopology
  gate: ResearchQualityGate
  researchGapQueue: ReturnType<typeof buildCanonicalResearchGapQueue>
  sourceIntegrity: ReturnType<typeof analyzeResearchSourceIntegrity>
  citationIntegrity: ReturnType<typeof analyzeCitationIntegrity>
  evidenceGradeConsistency: ReturnType<typeof analyzeEvidenceGradeConsistency>
  invariants: ResearchSnapshotInvariantReport
  remediationInvariants: ResearchRemediationInvariantReport
}

export type ScopedResearchQualityTopology = {
  analysis: ResearchQualityAnalysis
  topology: ResearchQualityTopology
  requestedProfileUrls: string[]
  matchedProfileUrls: string[]
  missingProfileUrls: string[]
  profileCoverage: number
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

/**
 * Restrict an already-canonical research analysis to an explicit URL set.
 * Every derived row is selected by the same profile URL key, so scoped
 * consumers cannot accidentally mix a public profile denominator with hidden
 * claim/profile rows from the full repository analysis.
 */
export function scopeResearchQualityAnalysis(
  analysis: ResearchQualityAnalysis,
  profileUrls: Iterable<string>,
): ResearchQualityAnalysis {
  const selected = new Set(profileUrls)
  return {
    ...analysis,
    profiles: analysis.profiles.filter((profile) => selected.has(profile.url)),
    profileAnalyses: analysis.profileAnalyses.filter((profile) => selected.has(profile.url)),
    claimAnalyses: analysis.claimAnalyses.filter((claim) => selected.has(claim.url)),
    structuredClaimAnalyses: analysis.structuredClaimAnalyses.filter((claim) => selected.has(claim.url)),
  }
}

/**
 * Canonical analysis+topology boundary for consumers whose visibility scope is
 * intentionally narrower than the full repository. The full analysis is built
 * with the same loaders/classifiers as CI, then scoped before any topology is
 * derived. The result also reports requested-vs-matched coverage so a consumer
 * cannot silently treat missing canonical detail profiles as analyzed.
 *
 * This is deliberately narrower than buildResearchQualitySnapshot:
 * grade/gate/remediation products are repository-wide and must not be presented
 * as scoped unless their own data loaders are scoped too.
 */
export function buildScopedResearchQualityTopology(
  root = process.cwd(),
  profileUrls: Iterable<string>,
): ScopedResearchQualityTopology {
  const requestedProfileUrls = [...new Set(profileUrls)].sort()
  const analysis = scopeResearchQualityAnalysis(analyzeResearchQuality(root), requestedProfileUrls)
  const matchedProfileUrls = analysis.profiles.map((profile) => profile.url).sort()
  const matched = new Set(matchedProfileUrls)
  const missingProfileUrls = requestedProfileUrls.filter((url) => !matched.has(url))
  const profileCoverage = round(
    requestedProfileUrls.length ? matchedProfileUrls.length / requestedProfileUrls.length : 1,
  )

  return {
    analysis,
    topology: buildResearchQualityTopology(analysis),
    requestedProfileUrls,
    matchedProfileUrls,
    missingProfileUrls,
    profileCoverage,
  }
}

/**
 * Canonical execution boundary for research-quality consumers.
 *
 * Specialized reporters may format different views, but they should consume
 * this snapshot instead of independently rebuilding analysis/topology/gate/policy,
 * citation/source-integrity, evidence-grade consistency, or remediation state.
 * The hard gate and remediation queue remain distinct views, but every hard
 * blocker must have an explicit remediation target. Snapshot invariants are
 * implementation contracts: contradictory derived views invalidate the snapshot
 * itself and therefore fail every canonical consumer.
 */
export function buildResearchQualitySnapshot(root = process.cwd()): ResearchQualitySnapshot {
  const analysis = analyzeResearchQuality(root)
  const topology = buildResearchQualityTopology(analysis)
  const evidenceGradeConsistency = analyzeEvidenceGradeConsistency(root, topology)
  const gate = buildResearchQualityGate(analysis, topology, evidenceGradeConsistency)
  const researchGapQueue = buildCanonicalResearchGapQueue(analysis, topology, evidenceGradeConsistency)
  const sourceIntegrity = analyzeResearchSourceIntegrity(analysis)
  const citationIntegrity = analyzeCitationIntegrity(analysis.profiles)
  const invariants = validateResearchQualitySnapshotInvariants(
    analysis,
    topology,
    gate,
    researchGapQueue,
    sourceIntegrity,
    citationIntegrity,
  )
  const remediationInvariants = validateResearchRemediationInvariants(gate, researchGapQueue)

  if (!invariants.passed) {
    const details = invariants.failures.slice(0, 10).map((failure) => `${failure.kind}: ${failure.detail}`).join('; ')
    throw new Error(
      `[research-quality-snapshot] ${invariants.summary.failures} internal invariant failure(s): ${details}`,
    )
  }
  if (!remediationInvariants.passed) {
    const details = remediationInvariants.failures.slice(0, 10).map((failure) => `${failure.kind}: ${failure.url}`).join('; ')
    throw new Error(
      `[research-quality-snapshot] ${remediationInvariants.summary.failures} gate/remediation invariant failure(s): ${details}`,
    )
  }

  return {
    analysis,
    topology,
    gate,
    researchGapQueue,
    sourceIntegrity,
    citationIntegrity,
    evidenceGradeConsistency,
    invariants,
    remediationInvariants,
  }
}
