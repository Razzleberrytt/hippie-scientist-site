#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()

const PATHS = {
  sourceCandidates: path.join(ROOT, 'ops', 'source-candidates.json'),
  sourceWaveTargets: path.join(ROOT, 'ops', 'reports', 'source-wave-2-targets.json'),
  sourceWaveCandidates: path.join(ROOT, 'ops', 'reports', 'source-wave-2-candidates.json'),
  sourceWaveReview: path.join(ROOT, 'ops', 'reports', 'source-wave-2-review.json'),
  submissionReview: path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json'),
  rollupReport: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-rollup.json'),
  summaryReport: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-runner-summary.json'),
}

const VALID_MODES = new Set(['full', 'source-review', 'authoring', 'submission-review', 'rollup-refresh'])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function runCommand(command, args) {
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit' })
}

function parseArgs(argv) {
  const parsed = { mode: 'full', targets: '', dryRun: false }

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
    'Usage: node scripts/run-enrichment-wave.mjs --targets <path> [--mode <full|source-review|authoring|submission-review|rollup-refresh>] [--dry-run]',
    '',
    'Examples:',
    '  npm run run:enrichment-wave -- --targets ops/reports/enrichment-wave-2-targets.json --mode full',
    '  npm run run:enrichment-wave -- --targets ops/reports/enrichment-wave-2b-targets.json --mode source-review',
  ].join('\n')
}

function loadTargets(targetPath) {
  const resolved = path.isAbsolute(targetPath) ? targetPath : path.join(ROOT, targetPath)
  if (!fs.existsSync(resolved)) {
    throw new Error(`Targets file not found: ${targetPath}`)
  }

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

function buildStagedInputs(targetReport) {
  const sourceCandidates = readJson(PATHS.sourceCandidates)
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

  const stagedTargetsPayload = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-wave-runner-target-staging-v1',
    selectionPolicy: {
      sourceTargetArtifact: targetReport.sourcePath,
      notes: 'Targets are explicitly declared by operator input to governed wave runner.',
    },
    targets: targetReport.targets,
  }

  const stagedCandidatesPayload = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-wave-runner-candidate-staging-v1',
    sourceCandidatesPath: path.relative(ROOT, PATHS.sourceCandidates),
    selectedTargetCount: targetReport.targets.length,
    candidates: waveCandidates,
  }

  return {
    selectedTargetCount: targetReport.targets.length,
    stagedCandidateCount: waveCandidates.length,
    stagedTargetPath: path.relative(ROOT, PATHS.sourceWaveTargets),
    stagedCandidatePath: path.relative(ROOT, PATHS.sourceWaveCandidates),
    stagedTargetsPayload,
    stagedCandidatesPayload,
  }
}

function stageWaveInputFiles(stagedInput) {
  const targetSnapshot = fs.existsSync(PATHS.sourceWaveTargets)
    ? fs.readFileSync(PATHS.sourceWaveTargets, 'utf8')
    : null
  const candidateSnapshot = fs.existsSync(PATHS.sourceWaveCandidates)
    ? fs.readFileSync(PATHS.sourceWaveCandidates, 'utf8')
    : null

  writeJson(PATHS.sourceWaveTargets, stagedInput.stagedTargetsPayload)
  writeJson(PATHS.sourceWaveCandidates, stagedInput.stagedCandidatesPayload)

  return () => {
    if (targetSnapshot === null) fs.rmSync(PATHS.sourceWaveTargets, { force: true })
    else fs.writeFileSync(PATHS.sourceWaveTargets, targetSnapshot, 'utf8')

    if (candidateSnapshot === null) fs.rmSync(PATHS.sourceWaveCandidates, { force: true })
    else fs.writeFileSync(PATHS.sourceWaveCandidates, candidateSnapshot, 'utf8')
  }
}

function phasePlan(mode) {
  if (mode === 'source-review') return ['source-review']
  if (mode === 'authoring') return ['authoring']
  if (mode === 'submission-review') return ['submission-review']
  if (mode === 'rollup-refresh') return ['rollup-refresh']
  return ['source-review', 'authoring', 'submission-review', 'rollup-refresh']
}

function runPhase(phase) {
  if (phase === 'source-review') {
    runCommand('npm', ['run', 'report:source-wave-2-review'])
    return
  }
  if (phase === 'authoring') {
    runCommand('npm', ['run', 'report:enrichment-authoring-packs'])
    return
  }
  if (phase === 'submission-review') {
    runCommand('npm', ['run', 'report:enrichment-submission-review'])
    return
  }
  if (phase === 'rollup-refresh') {
    runCommand('node', ['scripts/report-enrichment-wave-2-rollup.mjs'])
  }
}

function topicCovered(topic, coverage) {
  if (topic === 'evidence') return Number(coverage?.evidence || 0) > 0
  if (topic === 'safety' || topic === 'interactions' || topic === 'population-cautions') return Number(coverage?.safety || 0) > 0
  if (topic === 'mechanism') return Number(coverage?.mechanism || 0) > 0
  if (topic === 'constituent' || topic === 'conflict-uncertainty') return Number(coverage?.constituent || 0) > 0
  return false
}

function buildSummary(targetReport, plan, stageMeta, dryRun) {
  const summary = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-enrichment-wave-runner-summary-v1',
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

  if (fs.existsSync(PATHS.sourceWaveReview)) {
    const sourceReview = readJson(PATHS.sourceWaveReview)
    summary.sourceReview = {
      approvedNewSourceCount: Number(sourceReview?.summary?.approvedCount || 0),
      promotedToRegistryCount: Number(sourceReview?.summary?.promotedCount || 0),
      blockedCandidates: (sourceReview?.assessments || [])
        .filter(row => row.promotable === false)
        .map(row => ({
          candidateSourceId: row.candidateSourceId,
          reasons: row.promotionBlockedReasons || [],
        })),
    }
  }

  if (fs.existsSync(PATHS.submissionReview)) {
    const submissionReview = readJson(PATHS.submissionReview)
    summary.submissionReview = {
      approvedNewEnrichmentEntryCount: Number(submissionReview?.summary?.promotableCount || 0),
      promotedSubmissionIds: submissionReview?.promotion?.promotedSubmissionIds || [],
      blockedSubmissionIds: submissionReview?.promotion?.blockedSubmissionIds || [],
    }
  }

  if (fs.existsSync(PATHS.rollupReport)) {
    const rollup = readJson(PATHS.rollupReport)
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

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(usage())
    return
  }

  if (!args.targets) {
    throw new Error(`Missing required argument --targets\n\n${usage()}`)
  }

  if (!VALID_MODES.has(args.mode)) {
    throw new Error(`Invalid --mode value: ${args.mode}. Expected one of: ${Array.from(VALID_MODES).join(', ')}`)
  }

  const targetReport = loadTargets(args.targets)
  const stagedInput = buildStagedInputs(targetReport)
  const plan = phasePlan(args.mode)

  if (!args.dryRun) {
    const restoreStageFiles = stageWaveInputFiles(stagedInput)
    try {
      for (const phase of plan) runPhase(phase)
    } finally {
      restoreStageFiles()
    }
  }

  const summary = buildSummary(
    targetReport,
    plan,
    {
      selectedTargetCount: stagedInput.selectedTargetCount,
      stagedCandidateCount: stagedInput.stagedCandidateCount,
      stagedTargetPath: stagedInput.stagedTargetPath,
      stagedCandidatePath: stagedInput.stagedCandidatePath,
    },
    args.dryRun,
  )
  writeJson(PATHS.summaryReport, summary)

  console.log(`[run-enrichment-wave] mode=${args.mode} dryRun=${args.dryRun} targets=${targetReport.targets.length}`)
  console.log(`[run-enrichment-wave] phases=${plan.join(' -> ')}`)
  console.log(`[run-enrichment-wave] summary=${path.relative(ROOT, PATHS.summaryReport)}`)
}

main()
