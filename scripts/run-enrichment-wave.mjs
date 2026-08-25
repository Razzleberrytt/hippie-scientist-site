#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { normalizeRouteSlug } from '../lib/entity-identity.mjs'

const ROOT = process.cwd()
const VALID_MODES = new Set(['full', 'source-review', 'authoring', 'submission-review', 'rollup-refresh'])
const PHASES = {
  'source-review': { command: process.execPath, args: ['scripts/run-source-wave-review-authorized.mjs'] },
  authoring: { command: 'npx', args: ['tsx', 'scripts/report-enrichment-wave-authoring.ts'] },
  'submission-review': { command: 'npx', args: ['tsx', 'scripts/report-enrichment-submission-review.ts'] },
  'rollup-refresh': { command: process.execPath, args: ['scripts/report-enrichment-wave-rollup.mjs'] },
}

function safeWaveId(value) {
  const safe = normalizeRouteSlug(value)
  if (!safe) throw new Error(`Invalid --wave-id value: ${value}`)
  return safe
}

function buildWavePaths(waveId) {
  const safe = safeWaveId(waveId)
  const reports = path.join(ROOT, 'ops', 'reports')
  return {
    sourceCandidates: path.join(ROOT, 'ops', 'source-candidates.json'),
    sourceWaveTargets: path.join(reports, `source-${safe}-targets.json`),
    sourceWaveCandidates: path.join(reports, `source-${safe}-candidates.json`),
    sourceWaveSummary: path.join(reports, `source-${safe}-summary.md`),
    sourceWaveReview: path.join(reports, `source-${safe}-review.json`),
    sourceWaveReviewMd: path.join(reports, `source-${safe}-review.md`),
    submissionReview: path.join(reports, 'enrichment-submission-review.json'),
    authoringReport: path.join(reports, `enrichment-${safe}-authoring.json`),
    authoringMd: path.join(reports, `enrichment-${safe}-authoring.md`),
    rollupReport: path.join(reports, `enrichment-${safe}-rollup.json`),
    rollupMd: path.join(reports, `enrichment-${safe}-rollup.md`),
    summaryReport: path.join(reports, `enrichment-wave-runner-${safe}-summary.json`),
    genericizationReport: path.join(reports, 'enrichment-wave-runner-genericization.json'),
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
  const args = { mode: 'full', targets: '', dryRun: false, waveId: 'wave-2', help: false }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--dry-run') args.dryRun = true
    else if (token === '--help' || token === '-h') args.help = true
    else if (token === '--mode' || token === '--targets' || token === '--wave-id') {
      const key = token.slice(2).replace('wave-id', 'waveId')
      args[key] = argv[i + 1] || ''
      i += 1
    } else throw new Error(`Unknown argument: ${token}`)
  }
  return args
}

function usage() {
  return [
    'Usage: node scripts/run-enrichment-wave.mjs --wave-id <id> --targets <path> [--mode <full|source-review|authoring|submission-review|rollup-refresh>] [--dry-run]',
    '',
    'Examples:',
    '  node scripts/run-enrichment-wave.mjs --wave-id wave-3 --targets ops/targets/enrichment-wave-next.json --mode full',
    '  node scripts/run-enrichment-wave.mjs --wave-id safety-pass --targets ops/targets/enrichment-wave-safety.json --mode source-review',
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
    const entitySlug = normalizeRouteSlug(target?.entitySlug)
    if (!['herb', 'compound'].includes(entityType) || !entitySlug) {
      throw new Error(`Invalid target at index ${index}: expected entityType herb|compound and non-empty entitySlug`)
    }
    return {
      entityType,
      entitySlug,
      waveStatus: target.waveStatus || 'declared-target',
      selectionWhy: target.selectionWhy || 'Declared by target artifact.',
      highestPriorityMissingTopics: Array.isArray(target.highestPriorityMissingTopics) ? target.highestPriorityMissingTopics : [],
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
  const intakeQueue = readJson(path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'))
  const intakeById = new Map((intakeQueue?.tasks || []).map(task => [task.intakeTaskId, task]))
  const selectedKeys = new Set(targetReport.targets.map(target => `${target.entityType}:${target.entitySlug}`))

  const candidates = sourceCandidates
    .map(candidate => {
      const declared = Array.isArray(candidate.relatedEntities)
        ? candidate.relatedEntities
            .map(entity => ({ entityType: entity?.entityType, entitySlug: normalizeRouteSlug(entity?.entitySlug) }))
            .filter(entity => ['herb', 'compound'].includes(entity.entityType) && entity.entitySlug)
        : []
      if (declared.length) return { ...candidate, relatedEntities: declared, relatedTopicGaps: candidate.relatedTopicGaps || [] }

      const task = intakeById.get(candidate.intakeTaskId)
      const entityType = task?.itemType === 'compound_page' ? 'compound' : task?.itemType === 'herb_page' ? 'herb' : null
      const entitySlug = normalizeRouteSlug(task?.entitySlug)
      if (!entityType || !entitySlug) return null
      return { ...candidate, relatedEntities: [{ entityType, entitySlug }], relatedTopicGaps: task?.topicType ? [String(task.topicType)] : [] }
    })
    .filter(Boolean)
    .filter(candidate => candidate.relatedEntities.some(entity => selectedKeys.has(`${entity.entityType}:${entity.entitySlug}`)))

  return {
    selectedTargetCount: targetReport.targets.length,
    stagedCandidateCount: candidates.length,
    stagedTargetPath: path.relative(ROOT, paths.sourceWaveTargets),
    stagedCandidatePath: path.relative(ROOT, paths.sourceWaveCandidates),
    stagedTargetsPayload: {
      generatedAt: new Date().toISOString(),
      deterministicModelVersion: 'governed-wave-runner-target-staging-v2',
      selectionPolicy: { sourceTargetArtifact: targetReport.sourcePath, notes: 'Targets explicitly declared to the governed wave runner.' },
      targets: targetReport.targets,
    },
    stagedCandidatesPayload: {
      generatedAt: new Date().toISOString(),
      deterministicModelVersion: 'governed-wave-runner-candidate-staging-v2',
      sourceCandidatesPath: path.relative(ROOT, paths.sourceCandidates),
      selectedTargetCount: targetReport.targets.length,
      candidates,
    },
  }
}

function stageWaveInputFiles(staged, paths) {
  const snapshots = [paths.sourceWaveTargets, paths.sourceWaveCandidates].map(file =>
    fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null,
  )
  writeJson(paths.sourceWaveTargets, staged.stagedTargetsPayload)
  writeJson(paths.sourceWaveCandidates, staged.stagedCandidatesPayload)
  return () => {
    ;[paths.sourceWaveTargets, paths.sourceWaveCandidates].forEach((file, index) => {
      if (snapshots[index] === null) fs.rmSync(file, { force: true })
      else fs.writeFileSync(file, snapshots[index], 'utf8')
    })
  }
}

function phasePlan(mode) {
  return mode === 'full' ? Object.keys(PHASES) : [mode]
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

function preflight(plan) {
  for (const phase of plan) {
    const spec = PHASES[phase]
    if (!spec) throw new Error(`No implementation registered for phase: ${phase}`)
    const script = spec.args.at(-1)
    if (script?.startsWith('scripts/') && !fs.existsSync(path.join(ROOT, script))) {
      throw new Error(`Missing phase implementation for ${phase}: ${script}`)
    }
  }
}

function runPhase(phase, env) {
  const { command, args } = PHASES[phase]
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit', env })
}

function topicCovered(topic, coverage) {
  if (topic === 'evidence') return Number(coverage?.evidence || 0) > 0
  if (['safety', 'interactions', 'population-cautions'].includes(topic)) return Number(coverage?.safety || 0) > 0
  if (topic === 'mechanism') return Number(coverage?.mechanism || 0) > 0
  if (['constituent', 'conflict-uncertainty'].includes(topic)) return Number(coverage?.constituent || 0) > 0
  return false
}

function buildSummary(waveId, targetReport, plan, staged, dryRun, paths) {
  const sourceReview = fs.existsSync(paths.sourceWaveReview) ? readJson(paths.sourceWaveReview) : null
  const submissionReview = fs.existsSync(paths.submissionReview) ? readJson(paths.submissionReview) : null
  const rollup = fs.existsSync(paths.rollupReport) ? readJson(paths.rollupReport) : null
  const coverageDeltas = Array.isArray(rollup?.beforeAfterByWaveTarget)
    ? rollup.beforeAfterByWaveTarget.map(row => ({
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        beforeGovernedEntries: Number(row?.governedEntriesIncluded?.before || 0),
        afterGovernedEntries: Number(row?.governedEntriesIncluded?.after || 0),
        deltaGovernedEntries: Number(row?.governedEntriesIncluded?.delta || 0),
        beforeTopicCoverage: row?.topicCoverage?.before || {},
        afterTopicCoverage: row?.topicCoverage?.after || {},
      }))
    : []
  const byKey = new Map(coverageDeltas.map(row => [`${row.entityType}:${row.entitySlug}`, row]))

  return {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-enrichment-wave-runner-summary-v3',
    wave: { waveId, submissionPrefix: `sub_${safeWaveId(waveId).replace(/-/g, '')}-` },
    targetArtifact: { path: targetReport.sourcePath, generatedAt: targetReport.generatedAt, deterministicModelVersion: targetReport.deterministicModelVersion, selectedTargets: targetReport.targets },
    execution: {
      mode: plan.length === Object.keys(PHASES).length ? 'full' : plan[0],
      dryRun,
      phasesRun: plan,
      stagedInputs: staged,
      reportPaths: {
        sourceReview: path.relative(ROOT, paths.sourceWaveReview),
        authoring: path.relative(ROOT, paths.authoringReport),
        submissionReview: path.relative(ROOT, paths.submissionReview),
        rollup: path.relative(ROOT, paths.rollupReport),
      },
    },
    sourceReview: {
      approvedNewSourceCount: Number(sourceReview?.summary?.approvedCount || 0),
      promotedToRegistryCount: Number(sourceReview?.summary?.promotedCount || 0),
      blockedCandidates: (sourceReview?.candidateDecisions || []).filter(row => row.promotedSourceId == null).map(row => ({ candidateSourceId: row.candidateSourceId, reasons: row.reasons || [] })),
    },
    submissionReview: {
      approvedNewEnrichmentEntryCount: Number(submissionReview?.summary?.promotableCount || 0),
      promotedSubmissionIds: submissionReview?.promotion?.promotedSubmissionIds || [],
      blockedSubmissionIds: submissionReview?.promotion?.blockedSubmissionIds || [],
    },
    coverageDeltas,
    unresolvedCriticalGaps: targetReport.targets.map(target => {
      const after = byKey.get(`${target.entityType}:${target.entitySlug}`)?.afterTopicCoverage || {}
      const unresolved = target.highestPriorityMissingTopics.filter(topic => !topicCovered(topic, after))
      return { entityType: target.entityType, entitySlug: target.entitySlug, unresolvedCriticalTopics: unresolved, blockerReasons: unresolved.length ? ['critical_topic_still_uncovered_after_rollup'] : [] }
    }),
  }
}

function writeGenericizationSummary(paths) {
  writeJson(paths.genericizationReport, {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-wave-runner-genericization-v2',
    phases: Object.entries(PHASES).map(([phaseId, spec]) => ({ phaseId, executable: [spec.command, ...spec.args].join(' ') })),
    notes: 'The runner owns phase execution directly; package.json aliases are not required.',
  })
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) return console.log(usage())
  if (!args.targets) throw new Error(`Missing required argument --targets\n\n${usage()}`)
  if (!args.waveId) throw new Error(`Missing required argument --wave-id\n\n${usage()}`)
  if (!VALID_MODES.has(args.mode)) throw new Error(`Invalid --mode value: ${args.mode}. Expected one of: ${[...VALID_MODES].join(', ')}`)

  const waveId = safeWaveId(args.waveId)
  const paths = buildWavePaths(waveId)
  const targetReport = loadTargets(args.targets)
  const staged = buildStagedInputs(targetReport, paths)
  const plan = phasePlan(args.mode)
  preflight(plan)

  if (!args.dryRun) {
    const restore = stageWaveInputFiles(staged, paths)
    try {
      for (const phase of plan) runPhase(phase, wavePhaseEnv(waveId, paths))
    } finally {
      restore()
    }
  }

  const stageMeta = {
    selectedTargetCount: staged.selectedTargetCount,
    stagedCandidateCount: staged.stagedCandidateCount,
    stagedTargetPath: staged.stagedTargetPath,
    stagedCandidatePath: staged.stagedCandidatePath,
  }
  writeJson(paths.summaryReport, buildSummary(waveId, targetReport, plan, stageMeta, args.dryRun, paths))
  writeGenericizationSummary(paths)

  console.log(`[run-enrichment-wave] waveId=${waveId} mode=${args.mode} dryRun=${args.dryRun} targets=${targetReport.targets.length}`)
  console.log(`[run-enrichment-wave] phases=${plan.join(' -> ')}`)
  console.log(`[run-enrichment-wave] summary=${path.relative(ROOT, paths.summaryReport)}`)
}

main()
