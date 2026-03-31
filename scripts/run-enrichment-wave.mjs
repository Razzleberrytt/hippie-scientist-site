#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const VALID_MODES = new Set(['full', 'source-review', 'authoring', 'submission-review', 'rollup-refresh'])

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function safeWaveId(waveId) {
  const safe = slugify(waveId)
  if (!safe) throw new Error(`Invalid --wave-id value: ${waveId}`)
  return safe
}

function buildWavePaths(waveId) {
  const safe = safeWaveId(waveId)
  return {
    sourceCandidates: path.join(ROOT, 'ops', 'source-candidates.json'),
    sourceWaveTargets: path.join(ROOT, 'ops', 'reports', `source-${safe}-targets.json`),
    sourceWaveCandidates: path.join(ROOT, 'ops', 'reports', `source-${safe}-candidates.json`),
    sourceWaveSummary: path.join(ROOT, 'ops', 'reports', `source-${safe}-summary.md`),
    sourceWaveReview: path.join(ROOT, 'ops', 'reports', `source-${safe}-review.json`),
    sourceWaveReviewMd: path.join(ROOT, 'ops', 'reports', `source-${safe}-review.md`),
    submissionReview: path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json'),
    authoringReport: path.join(ROOT, 'ops', 'reports', `enrichment-${safe}-authoring.json`),
    authoringMd: path.join(ROOT, 'ops', 'reports', `enrichment-${safe}-authoring.md`),
    rollupReport: path.join(ROOT, 'ops', 'reports', `enrichment-${safe}-rollup.json`),
    rollupMd: path.join(ROOT, 'ops', 'reports', `enrichment-${safe}-rollup.md`),
    summaryReport: path.join(ROOT, 'ops', 'reports', `enrichment-wave-runner-${safe}-summary.json`),
    genericizationReport: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-runner-genericization.json'),
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function parseArgs(argv) {
  const parsed = { mode: 'full', targets: '', dryRun: false, waveId: 'wave-2' }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--mode') {
      parsed.mode = argv[i + 1] || ''
      i += 1
      continue
    }
    if (token === '--targets') {
      parsed.targets = argv[i + 1] || ''
      i += 1
      continue
    }
    if (token === '--wave-id') {
      parsed.waveId = argv[i + 1] || ''
      i += 1
      continue
    }
    if (token === '--dry-run') {
      parsed.dryRun = true
      continue
    }
    if (token === '--help' || token === '-h') {
      parsed.help = true
      continue
    }
    throw new Error(`Unknown argument: ${token}`)
  }

  return parsed
}

function usage() {
  return [
    'Usage: node scripts/run-enrichment-wave.mjs --wave-id <id> --targets <path> [--mode <full|source-review|authoring|submission-review|rollup-refresh>] [--dry-run]',
    '',
    'Examples:',
    '  npm run run:enrichment-wave -- --wave-id wave-3 --targets ops/reports/enrichment-wave-2-targets.json --mode full',
    '  npm run run:enrichment-wave -- --wave-id wave-2b --targets ops/reports/enrichment-wave-2b-targets.json --mode source-review',
  ].join('\n')
}

function loadTargets(targetPath) {
  const resolved = path.isAbsolute(targetPath) ? targetPath : path.join(ROOT, targetPath)
  if (!fs.existsSync(resolved)) throw new Error(`Targets file not found: ${targetPath}`)

  const payload = readJson(resolved)
  if (!Array.isArray(payload?.targets) || payload.targets.length === 0) {
    throw new Error(`Targets file must include a non-empty targets array: ${targetPath}`)
  }

  const targets = payload.targets.map((target, index) => {
    const entityType = target?.entityType
    const entitySlug = slugify(target?.entitySlug)
    if (!['herb', 'compound'].includes(entityType) || !entitySlug) {
      throw new Error(`Invalid target at index ${index}: expected entityType herb|compound and non-empty entitySlug`)
    }

    return {
      entityType,
      entitySlug,
      waveStatus: target.waveStatus || 'declared-target',
      selectionWhy: target.selectionWhy || 'Declared by target artifact.',
      highestPriorityMissingTopics: Array.isArray(target.highestPriorityMissingTopics)
        ? target.highestPriorityMissingTopics
        : [],
      criticality: Array.isArray(target.criticality) ? target.criticality : [],
      currentGovernedCoverageStatus: target.currentGovernedCoverageStatus || 'unknown',
    }
  })

  return {
    sourcePath: path.relative(ROOT, resolved),
    generatedAt: payload.generatedAt || null,
    deterministicModelVersion: payload.deterministicModelVersion || null,
    targets,
  }
}

function buildStagedInputs(targetReport, paths) {
  const sourceCandidates = readJson(paths.sourceCandidates)
  const selectedKeys = new Set(targetReport.targets.map(target => `${target.entityType}:${target.entitySlug}`))

  const waveCandidates = sourceCandidates
    .filter(candidate => Array.isArray(candidate.relatedEntities))
    .filter(candidate =>
      candidate.relatedEntities.some(entity => {
        const entityType = entity?.entityType
        const entitySlug = slugify(entity?.entitySlug)
        return selectedKeys.has(`${entityType}:${entitySlug}`)
      }),
    )

  return {
    selectedTargetCount: targetReport.targets.length,
    stagedCandidateCount: waveCandidates.length,
    stagedTargetPath: path.relative(ROOT, paths.sourceWaveTargets),
    stagedCandidatePath: path.relative(ROOT, paths.sourceWaveCandidates),
    stagedTargetsPayload: {
      generatedAt: new Date().toISOString(),
      deterministicModelVersion: 'governed-wave-runner-target-staging-v1',
      selectionPolicy: {
        sourceTargetArtifact: targetReport.sourcePath,
        notes: 'Targets are explicitly declared by operator input to governed wave runner.',
      },
      targets: targetReport.targets,
    },
    stagedCandidatesPayload: {
      generatedAt: new Date().toISOString(),
      deterministicModelVersion: 'governed-wave-runner-candidate-staging-v1',
      sourceCandidatesPath: path.relative(ROOT, paths.sourceCandidates),
      selectedTargetCount: targetReport.targets.length,
      candidates: waveCandidates,
    },
  }
}

function stageWaveInputFiles(stagedInput, paths) {
  const targetSnapshot = fs.existsSync(paths.sourceWaveTargets)
    ? fs.readFileSync(paths.sourceWaveTargets, 'utf8')
    : null
  const candidateSnapshot = fs.existsSync(paths.sourceWaveCandidates)
    ? fs.readFileSync(paths.sourceWaveCandidates, 'utf8')
    : null

  writeJson(paths.sourceWaveTargets, stagedInput.stagedTargetsPayload)
  writeJson(paths.sourceWaveCandidates, stagedInput.stagedCandidatesPayload)

  return () => {
    if (targetSnapshot === null) fs.rmSync(paths.sourceWaveTargets, { force: true })
    else fs.writeFileSync(paths.sourceWaveTargets, targetSnapshot, 'utf8')

    if (candidateSnapshot === null) fs.rmSync(paths.sourceWaveCandidates, { force: true })
    else fs.writeFileSync(paths.sourceWaveCandidates, candidateSnapshot, 'utf8')
  }
}

function phasePlan(mode) {
  if (mode === 'source-review') return ['source-review']
  if (mode === 'authoring') return ['authoring']
  if (mode === 'submission-review') return ['submission-review']
  if (mode === 'rollup-refresh') return ['rollup-refresh']
  return ['source-review', 'authoring', 'submission-review', 'rollup-refresh']
}

function wavePhaseEnv(waveId, paths) {
  return {
    ...process.env,
    ENRICHMENT_WAVE_ID: waveId,
    ENRICHMENT_WAVE_SUBMISSION_PREFIX: `sub_${safeWaveId(waveId).replace(/-/g, '')}-`,
    ENRICHMENT_WAVE_TARGETS_PATH: paths.sourceWaveTargets,
    ENRICHMENT_WAVE_CANDIDATES_PATH: paths.sourceWaveCandidates,
    ENRICHMENT_WAVE_SOURCE_SUMMARY_PATH: paths.sourceWaveSummary,
    ENRICHMENT_WAVE_SOURCE_REVIEW_JSON_PATH: paths.sourceWaveReview,
    ENRICHMENT_WAVE_SOURCE_REVIEW_MD_PATH: paths.sourceWaveReviewMd,
    ENRICHMENT_WAVE_AUTHORING_JSON_PATH: paths.authoringReport,
    ENRICHMENT_WAVE_AUTHORING_MD_PATH: paths.authoringMd,
    ENRICHMENT_WAVE_ROLLUP_JSON_PATH: paths.rollupReport,
    ENRICHMENT_WAVE_ROLLUP_MD_PATH: paths.rollupMd,
  }
}

function runCommand(command, args, env) {
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit', env })
}

function runPhase(phase, env) {
  if (phase === 'source-review') {
    runCommand('npm', ['run', 'report:source-wave-2-review'], env)
    return
  }
  if (phase === 'authoring') {
    runCommand('npm', ['run', 'report:enrichment-authoring-packs'], env)
    return
  }
  if (phase === 'submission-review') {
    runCommand('npm', ['run', 'report:enrichment-submission-review'], env)
    return
  }
  if (phase === 'rollup-refresh') {
    runCommand('node', ['scripts/report-enrichment-wave-2-rollup.mjs'], env)
  }
}

function topicCovered(topic, coverage) {
  if (topic === 'evidence') return Number(coverage?.evidence || 0) > 0
  if (topic === 'safety' || topic === 'interactions' || topic === 'population-cautions') return Number(coverage?.safety || 0) > 0
  if (topic === 'mechanism') return Number(coverage?.mechanism || 0) > 0
  if (topic === 'constituent' || topic === 'conflict-uncertainty') return Number(coverage?.constituent || 0) > 0
  return false
}

function buildSummary(waveId, targetReport, plan, stageMeta, dryRun, paths) {
  const summary = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-enrichment-wave-runner-summary-v2',
    wave: {
      waveId,
      submissionPrefix: `sub_${safeWaveId(waveId).replace(/-/g, '')}-`,
    },
    targetArtifact: {
      path: targetReport.sourcePath,
      generatedAt: targetReport.generatedAt,
      deterministicModelVersion: targetReport.deterministicModelVersion,
      selectedTargets: targetReport.targets,
    },
    execution: {
      mode: plan.length === 4 ? 'full' : plan[0],
      dryRun,
      phasesRun: plan,
      stagedInputs: stageMeta,
      reportPaths: {
        sourceReview: path.relative(ROOT, paths.sourceWaveReview),
        authoring: path.relative(ROOT, paths.authoringReport),
        submissionReview: path.relative(ROOT, paths.submissionReview),
        rollup: path.relative(ROOT, paths.rollupReport),
      },
    },
    sourceReview: {
      approvedNewSourceCount: 0,
      promotedToRegistryCount: 0,
      blockedCandidates: [],
    },
    submissionReview: {
      approvedNewEnrichmentEntryCount: 0,
      promotedSubmissionIds: [],
      blockedSubmissionIds: [],
    },
    coverageDeltas: [],
    unresolvedCriticalGaps: [],
  }

  if (fs.existsSync(paths.sourceWaveReview)) {
    const sourceReview = readJson(paths.sourceWaveReview)
    summary.sourceReview = {
      approvedNewSourceCount: Number(sourceReview?.summary?.approvedCount || 0),
      promotedToRegistryCount: Number(sourceReview?.summary?.promotedCount || 0),
      blockedCandidates: (sourceReview?.candidateDecisions || [])
        .filter(row => row.promotedSourceId == null)
        .map(row => ({
          candidateSourceId: row.candidateSourceId,
          reasons: row.reasons || [],
        })),
    }
  }

  if (fs.existsSync(paths.submissionReview)) {
    const submissionReview = readJson(paths.submissionReview)
    summary.submissionReview = {
      approvedNewEnrichmentEntryCount: Number(submissionReview?.summary?.promotableCount || 0),
      promotedSubmissionIds: submissionReview?.promotion?.promotedSubmissionIds || [],
      blockedSubmissionIds: submissionReview?.promotion?.blockedSubmissionIds || [],
    }
  }

  if (fs.existsSync(paths.rollupReport)) {
    const rollup = readJson(paths.rollupReport)
    const deltaRows = Array.isArray(rollup?.beforeAfterByWaveTarget) ? rollup.beforeAfterByWaveTarget : []

    summary.coverageDeltas = deltaRows.map(row => ({
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      beforeGovernedEntries: Number(row?.governedEntriesIncluded?.before || 0),
      afterGovernedEntries: Number(row?.governedEntriesIncluded?.after || 0),
      deltaGovernedEntries: Number(row?.governedEntriesIncluded?.delta || 0),
      beforeTopicCoverage: row?.topicCoverage?.before || {},
      afterTopicCoverage: row?.topicCoverage?.after || {},
    }))

    const byKey = new Map(summary.coverageDeltas.map(row => [`${row.entityType}:${row.entitySlug}`, row]))
    summary.unresolvedCriticalGaps = targetReport.targets.map(target => {
      const key = `${target.entityType}:${target.entitySlug}`
      const delta = byKey.get(key)
      const afterCoverage = delta?.afterTopicCoverage || {}
      const unresolved = target.highestPriorityMissingTopics.filter(topic => !topicCovered(topic, afterCoverage))
      return {
        entityType: target.entityType,
        entitySlug: target.entitySlug,
        unresolvedCriticalTopics: unresolved,
        blockerReasons: unresolved.length > 0 ? ['critical_topic_still_uncovered_after_rollup'] : [],
      }
    })
  }

  return summary
}

function writeGenericizationSummary(paths) {
  const summary = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-wave-runner-genericization-v1',
    extractedWaveAgnosticPhases: [
      {
        phaseId: 'source-review',
        reusedScript: 'scripts/report-source-wave-2-review.ts',
        parameterInputs: ['ENRICHMENT_WAVE_ID', 'ENRICHMENT_WAVE_TARGETS_PATH', 'ENRICHMENT_WAVE_CANDIDATES_PATH'],
      },
      {
        phaseId: 'authoring',
        reusedScript: 'scripts/report-enrichment-wave-2-authoring.ts',
        parameterInputs: ['ENRICHMENT_WAVE_ID', 'ENRICHMENT_WAVE_TARGETS_PATH', 'ENRICHMENT_WAVE_SUBMISSION_PREFIX'],
      },
      {
        phaseId: 'submission-review',
        reusedScript: 'scripts/report-enrichment-submission-review.ts',
        parameterInputs: [],
      },
      {
        phaseId: 'rollup-refresh',
        reusedScript: 'scripts/report-enrichment-wave-2-rollup.mjs',
        parameterInputs: ['ENRICHMENT_WAVE_ID', 'ENRICHMENT_WAVE_TARGETS_PATH', 'ENRICHMENT_WAVE_SUBMISSION_PREFIX'],
      },
    ],
    waveAwareOutputPattern: {
      sourceTargets: 'ops/reports/source-<wave-id>-targets.json',
      sourceCandidates: 'ops/reports/source-<wave-id>-candidates.json',
      sourceReview: 'ops/reports/source-<wave-id>-review.{json,md}',
      authoring: 'ops/reports/enrichment-<wave-id>-authoring.{json,md}',
      rollup: 'ops/reports/enrichment-<wave-id>-rollup.{json,md}',
      runnerSummary: 'ops/reports/enrichment-wave-runner-<wave-id>-summary.json',
    },
  }

  writeJson(paths.genericizationReport, summary)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(usage())
    return
  }
  if (!args.targets) throw new Error(`Missing required argument --targets\n\n${usage()}`)
  if (!args.waveId) throw new Error(`Missing required argument --wave-id\n\n${usage()}`)
  if (!VALID_MODES.has(args.mode)) throw new Error(`Invalid --mode value: ${args.mode}. Expected one of: ${Array.from(VALID_MODES).join(', ')}`)

  const waveId = safeWaveId(args.waveId)
  const paths = buildWavePaths(waveId)
  const env = wavePhaseEnv(waveId, paths)
  const targetReport = loadTargets(args.targets)
  const stagedInput = buildStagedInputs(targetReport, paths)
  const plan = phasePlan(args.mode)

  if (!args.dryRun) {
    const restoreStageFiles = stageWaveInputFiles(stagedInput, paths)
    try {
      for (const phase of plan) runPhase(phase, env)
    } finally {
      restoreStageFiles()
    }
  }

  const summary = buildSummary(
    waveId,
    targetReport,
    plan,
    {
      selectedTargetCount: stagedInput.selectedTargetCount,
      stagedCandidateCount: stagedInput.stagedCandidateCount,
      stagedTargetPath: stagedInput.stagedTargetPath,
      stagedCandidatePath: stagedInput.stagedCandidatePath,
    },
    args.dryRun,
    paths,
  )
  writeJson(paths.summaryReport, summary)
  writeGenericizationSummary(paths)

  console.log(`[run-enrichment-wave] waveId=${waveId} mode=${args.mode} dryRun=${args.dryRun} targets=${targetReport.targets.length}`)
  console.log(`[run-enrichment-wave] phases=${plan.join(' -> ')}`)
  console.log(`[run-enrichment-wave] summary=${path.relative(ROOT, paths.summaryReport)}`)
}

main()
