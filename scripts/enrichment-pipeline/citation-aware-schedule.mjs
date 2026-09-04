#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { shardOf } from './lib/ids.mjs'
import { createCanonicalOwnerResolver } from './lib/canonical-owner.mjs'
import { aiCitationManifestFreshness } from './lib/ai-citation-freshness.mjs'
import { portfolioSelect } from './lib/portfolio-select.mjs'
import { scheduleShard } from './lib/control-plane.mjs'

const ROOT = process.cwd()
const SIGNALS = path.join(ROOT, 'config', 'ai-citation-swarm-priorities.json')
const SESSION_MANIFEST = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

const inputFile = process.argv[2] ? path.resolve(process.argv[2]) : null
const shard = Number(process.argv[3] ?? 0)
const limit = Number(process.argv[4] ?? 0)
if (!inputFile) {
  console.error('Usage: citation-aware-schedule.mjs <workpacks.json> <shard> [limit]')
  process.exit(2)
}

const input = readJson(inputFile, null)
if (!Array.isArray(input)) {
  console.error(`[citation-aware-schedule] expected a JSON array: ${inputFile}`)
  process.exit(2)
}

const signals = readJson(SIGNALS, null)
if (!signals || !Array.isArray(signals.defendUrls) || !signals.entityBoosts) {
  console.error('[citation-aware-schedule] missing or invalid config/ai-citation-swarm-priorities.json')
  process.exit(1)
}
const signalFreshness = aiCitationManifestFreshness(signals)
const activeSignals = signalFreshness.fresh ? signals : null
if (!activeSignals) {
  console.error(`[citation-aware-schedule] ignoring ${signalFreshness.reason} AI citation snapshot ${signalFreshness.snapshotLabel ?? 'unknown'}; using citation-neutral scheduling`)
}

const sessionManifest = readJson(SESSION_MANIFEST, { shardCount: 8 })
const shardCount = Number(sessionManifest?.shardCount ?? 8)
if (!Number.isInteger(shard) || shard < 0 || shard >= shardCount) {
  console.error(`[citation-aware-schedule] shard must be 0..${shardCount - 1}`)
  process.exit(2)
}
if (!Number.isFinite(limit) || limit < 0) {
  console.error('[citation-aware-schedule] optional limit must be a non-negative number')
  process.exit(2)
}

const ownerResolver = createCanonicalOwnerResolver({ root: ROOT })
const ranked = scheduleShard(
  input,
  shard,
  shardCount,
  shardOf,
  ownerResolver.resolveWorkpack,
  { aiCitationManifest: activeSignals },
)
const effectiveLimit = Math.floor(limit)
const selected = portfolioSelect(
  ranked,
  effectiveLimit,
  activeSignals ? signals.capacityPolicy : null,
  { citationEnabled: Boolean(activeSignals) },
)

const summary = {
  snapshotLabel: signals.snapshotLabel ?? null,
  citationSignalStatus: signalFreshness.fresh ? 'fresh' : 'stale_ignored',
  citationSignalReason: signalFreshness.reason,
  citationSignalExpiresAt: signalFreshness.expiresAt,
  measurementBoundary: signals.measurementBoundary ?? null,
  capacityPolicy: activeSignals ? (signals.capacityPolicy ?? null) : null,
  shard,
  shardCount,
  availableWorkpacks: ranked.length,
  selectedWorkpacks: selected.length,
  directlyDefended: selected.filter(item => item.aiCitationDefend === true).length,
  citationAdjacent: selected.filter(item => Number(item.aiCitationPriority ?? 0) > 0).length,
  exploration: selected.filter(item => Number(item.aiCitationPriority ?? 0) <= 0).length,
}

console.error(`[citation-aware-schedule] snapshot=${summary.snapshotLabel ?? 'unknown'} signal=${summary.citationSignalStatus} shard=${shard}/${shardCount} selected=${selected.length}/${ranked.length} citation-adjacent=${summary.citationAdjacent} exploration=${summary.exploration}`)
console.log(JSON.stringify({ summary, workpacks: selected }, null, 2))
