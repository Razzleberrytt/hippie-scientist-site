#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { shardOf } from './lib/ids.mjs'
import { createCanonicalOwnerResolver } from './lib/canonical-owner.mjs'
import { aiCitationManifestFreshness, aiCitationSignalStatus } from './lib/ai-citation-freshness.mjs'
import { portfolioSelect } from './lib/portfolio-select.mjs'
import { scheduleShard } from './lib/control-plane.mjs'

const ROOT = process.cwd()
const SIGNALS = path.join(ROOT, 'config', 'ai-citation-swarm-priorities.json')
const SESSION_MANIFEST = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function unavailableFreshness(reason, signals = null) {
  const configuredMaxAge = Number(signals?.freshnessPolicy?.maxAgeDays)
  return {
    fresh: false,
    reason,
    snapshotLabel: signals?.snapshotLabel ?? null,
    maxAgeDays: Number.isFinite(configuredMaxAge) && configuredMaxAge >= 0 ? configuredMaxAge : null,
    ageDays: null,
    expiresAt: null,
  }
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

const signalFilePresent = fs.existsSync(SIGNALS)
const signals = signalFilePresent ? readJson(SIGNALS, null) : null
const signalManifestValid = Boolean(
  signals
  && Array.isArray(signals.defendUrls)
  && signals.entityBoosts
  && typeof signals.entityBoosts === 'object'
  && !Array.isArray(signals.entityBoosts),
)

let signalFreshness
if (!signalFilePresent) {
  signalFreshness = unavailableFreshness('manifest_missing')
} else if (!signals) {
  signalFreshness = unavailableFreshness('manifest_unparseable')
} else if (!signalManifestValid) {
  signalFreshness = unavailableFreshness('manifest_shape_invalid', signals)
} else {
  signalFreshness = aiCitationManifestFreshness(signals)
}

const signalStatus = aiCitationSignalStatus({
  manifestPresent: signalFilePresent,
  manifestValid: Boolean(signals) && signalManifestValid,
  freshness: signalFreshness,
})
const activeSignals = signalStatus === 'active' ? signals : null

if (!activeSignals) {
  console.error(`[citation-aware-schedule] ignoring AI citation signal status=${signalStatus} reason=${signalFreshness.reason}; using citation-neutral scheduling`)
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
  snapshotLabel: signals?.snapshotLabel ?? null,
  citationSignalStatus: signalStatus,
  citationSignalReason: signalFreshness.reason,
  citationSignalAgeDays: signalFreshness.ageDays,
  citationSignalMaxAgeDays: signalFreshness.maxAgeDays,
  citationSignalExpiresAt: signalFreshness.expiresAt,
  measurementBoundary: signals?.measurementBoundary ?? null,
  capacityPolicy: activeSignals ? (signals.capacityPolicy ?? null) : null,
  shard,
  shardCount,
  availableWorkpacks: ranked.length,
  selectedWorkpacks: selected.length,
  directlyDefended: selected.filter(item => item.aiCitationDefend === true).length,
  citationAdjacent: selected.filter(item => Number(item.aiCitationPriority ?? 0) > 0).length,
  exploration: selected.filter(item => Number(item.aiCitationPriority ?? 0) <= 0).length,
}

console.error(`[citation-aware-schedule] snapshot=${summary.snapshotLabel ?? 'unknown'} signal=${summary.citationSignalStatus} reason=${summary.citationSignalReason} shard=${shard}/${shardCount} selected=${selected.length}/${ranked.length} citation-adjacent=${summary.citationAdjacent} exploration=${summary.exploration}`)
console.log(JSON.stringify({ summary, workpacks: selected }, null, 2))
