import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const OUTCOMES = new Set(['SHIPPED', 'VALIDATED', 'STAGED', 'BLOCKED', 'NO_PROGRESS'])
export const LANES = new Set(['lane1', 'lane2', 'lane3', 'lane4', 'lane5'])

export function validateState(state) {
  if (!state || state.version !== 1) throw new Error('unsupported swarm operational state version')
  if (!state.lanes || typeof state.lanes !== 'object') throw new Error('lanes object is required')
  for (const lane of LANES) {
    if (!(lane in state.lanes)) throw new Error(`missing ${lane}`)
    const record = state.lanes[lane]
    if (record !== null) validateOutcome(record, lane)
  }
  if (!Array.isArray(state.activeWork)) throw new Error('activeWork must be an array')
  const keys = new Set()
  for (const item of state.activeWork) {
    if (!item || typeof item.canonicalKey !== 'string' || item.canonicalKey.length === 0) {
      throw new Error('active work requires canonicalKey')
    }
    if (keys.has(item.canonicalKey)) throw new Error(`duplicate active work: ${item.canonicalKey}`)
    keys.add(item.canonicalKey)
    if (!LANES.has(item.lane)) throw new Error(`invalid active-work lane: ${item.lane}`)
  }
  return true
}

function validateOutcome(record, lane) {
  if (record.lane !== lane) throw new Error(`lane mismatch for ${lane}`)
  if (!OUTCOMES.has(record.outcome)) throw new Error(`invalid outcome for ${lane}`)
  for (const field of ['canonicalWorkItem', 'rootBlocker', 'fallbackUsed', 'lastMaterialChange', 'nextAction', 'recordedAt']) {
    if (typeof record[field] !== 'string') throw new Error(`missing ${field} for ${lane}`)
  }
}

export function deriveScoreboard(state) {
  validateState(state)
  const score = { shipped: 0, validated: 0, staged: 0, blocked: 0, noProgress: 0 }
  for (const record of Object.values(state.lanes)) {
    if (!record) continue
    if (record.outcome === 'SHIPPED') score.shipped++
    if (record.outcome === 'VALIDATED') score.validated++
    if (record.outcome === 'STAGED') score.staged++
    if (record.outcome === 'BLOCKED') score.blocked++
    if (record.outcome === 'NO_PROGRESS') score.noProgress++
  }
  return score
}

export function recordOutcome(state, lane, record) {
  validateState(state)
  if (!LANES.has(lane)) throw new Error(`invalid lane: ${lane}`)
  const next = structuredClone(state)
  next.lanes[lane] = { ...record, lane }
  validateOutcome(next.lanes[lane], lane)
  next.updatedAt = record.recordedAt
  next.scoreboard = deriveScoreboard(next)
  return next
}

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const defaultStatePath = path.join(repoRoot, 'ops', 'swarm-operational-state.json')

function readState(file = defaultStatePath) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const command = process.argv[2] ?? 'validate'
  const state = readState()
  if (command === 'validate') {
    validateState(state)
    process.stdout.write('swarm operational state valid\n')
  } else if (command === 'scoreboard') {
    process.stdout.write(`${JSON.stringify(deriveScoreboard(state))}\n`)
  } else {
    throw new Error(`unknown command: ${command}`)
  }
}
