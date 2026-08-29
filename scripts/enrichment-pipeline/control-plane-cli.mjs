#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { shardOf } from './lib/ids.mjs'
import {
  admissionDecision, computeSessionYield, fanoutCandidates, prioritizeSubmissions,
  promotionDecision, scheduleShard, scoreOrphan,
} from './lib/control-plane.mjs'

const ROOT = process.cwd()
const FRAGMENT_ROOT = path.join(ROOT, 'ops', 'enrichment-submissions', 'sessions')
const SOURCE_REGISTRY = path.join(ROOT, 'public', 'data', 'source-registry.json')
const MANIFEST = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')
const OUTPUT = path.join(ROOT, 'artifacts', 'enrichment-control-plane.json')

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function listJson(root) {
  if (!fs.existsSync(root)) return []
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(root, entry.name)
    return entry.isDirectory() ? listJson(full) : entry.name.endsWith('.json') ? [full] : []
  }).sort()
}
function loadSubmissions() {
  return listJson(FRAGMENT_ROOT).flatMap(file => {
    const fragment = readJson(file, null)
    return (fragment?.submissions ?? []).map(submission => ({ ...submission, sessionId: fragment.sessionId, shard: fragment.shard }))
  })
}

const command = process.argv[2] ?? 'report'
const submissions = loadSubmissions()
const sources = readJson(SOURCE_REGISTRY, [])
const sourceById = new Map(sources.map(source => [source.sourceId, source]))
const manifest = readJson(MANIFEST, { shardCount: 8, sessions: [] })

if (command === 'report' || command === 'validate') {
  const promotion = submissions.map(submission => ({
    submissionId: submission.submissionId,
    ...promotionDecision(submission, sourceById.get(submission.sourceId)),
  }))
  const report = {
    generatedAt: new Date().toISOString(),
    summary: computeSessionYield(submissions),
    routes: Object.groupBy
      ? Object.groupBy(prioritizeSubmissions(submissions), item => item.route)
      : prioritizeSubmissions(submissions).reduce((acc, item) => ((acc[item.route] ??= []).push(item), acc), {}),
    promotion: {
      eligible: promotion.filter(item => item.eligible).length,
      blocked: promotion.filter(item => !item.eligible).length,
      decisions: promotion,
    },
    sessions: Object.fromEntries((manifest.sessions ?? []).map(session => [session.sessionId,
      computeSessionYield(submissions.filter(s => s.sessionId === session.sessionId))
    ])),
    fanout: sources.flatMap(source => fanoutCandidates(source, submissions).map(candidate => ({ sourceId: source.sourceId, ...candidate }))),
  }
  if (command === 'validate') {
    const unsafe = promotion.filter(item => item.eligible && (item.semantic !== 'verified' || item.route === 'source_quarantine'))
    if (unsafe.length) {
      console.error(JSON.stringify({ unsafe }, null, 2)); process.exitCode = 1
    } else console.log('Enrichment control-plane invariants are safe.')
  } else {
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
    fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify(report.summary, null, 2))
    console.log(`report: ${path.relative(ROOT, OUTPUT)}`)
  }
} else if (command === 'admission') {
  const queuedRuns = Number(process.env.ENRICHMENT_QUEUED_RUNS ?? 0)
  const inProgressRuns = Number(process.env.ENRICHMENT_IN_PROGRESS_RUNS ?? 0)
  const openEnrichmentPrs = Number(process.env.ENRICHMENT_OPEN_PRS ?? 0)
  console.log(JSON.stringify(admissionDecision({ queuedRuns, inProgressRuns, openEnrichmentPrs }), null, 2))
} else if (command === 'schedule') {
  const input = readJson(process.argv[3] ? path.resolve(process.argv[3]) : '', [])
  const shard = Number(process.argv[4] ?? 0)
  console.log(JSON.stringify(scheduleShard(input, shard, manifest.shardCount ?? 8, shardOf), null, 2))
} else if (command === 'orphans') {
  const input = readJson(process.argv[3] ? path.resolve(process.argv[3]) : '', [])
  const ranked = input.map(item => ({ ...item, roi: scoreOrphan(item) }))
    .sort((a,b) => b.roi.score - a.roi.score || String(a.sourceId ?? '').localeCompare(String(b.sourceId ?? '')))
  console.log(JSON.stringify(ranked, null, 2))
} else {
  console.error('Usage: control-plane-cli.mjs [report|validate|admission|schedule <json> <shard>|orphans <json>]')
  process.exitCode = 2
}
