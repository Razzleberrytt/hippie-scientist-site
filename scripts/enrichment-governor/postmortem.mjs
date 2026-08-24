import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { contract, quarantineDecision } from './governor.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const stateDir = path.join(repoRoot, 'ops', 'enrichment-governor')

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function appendJsonl(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`)
}

export function recordPostmortem(input) {
  if (!input?.key || !input?.rootCause) throw new Error('postmortem requires key and rootCause')
  const at = input.at || new Date().toISOString()
  const postmortem = {
    id: input.id || `pm_${Date.now()}`,
    at,
    key: input.key,
    category: input.category || 'unknown',
    rootCause: input.rootCause,
    earliestCatchPoint: input.earliestCatchPoint || null,
    impact: input.impact || null,
    proposedImprovement: input.proposedImprovement || null,
    benchmarkEvidence: input.benchmarkEvidence || null,
    disposition: input.disposition || 'observe',
    pr: input.pr || null,
    commit: input.commit || null,
  }
  appendJsonl(path.join(stateDir, 'postmortems.jsonl'), postmortem)
  appendJsonl(path.join(stateDir, 'ledger.jsonl'), { event: 'postmortem_recorded', at, key: input.key, category: postmortem.category, disposition: postmortem.disposition })

  const quarantine = loadJson(path.join(stateDir, 'quarantine.json'), { version: 1, cases: [] })
  const existing = (quarantine.cases || []).find(row => row.key === input.key)
  const next = {
    ...(existing || { key: input.key, consecutiveFailures: 0 }),
    consecutiveFailures: Number(existing?.consecutiveFailures || 0) + 1,
    lastFailureAt: at,
    lastRootCause: input.rootCause,
  }
  const decision = quarantineDecision(next, Date.parse(at))
  next.quarantined = decision.quarantined
  next.releaseAt = decision.releaseAt || next.releaseAt || null
  next.releaseRequiresMaterialChange = contract.quarantine.releaseRequiresMaterialChange
  const cases = [...(quarantine.cases || []).filter(row => row.key !== input.key), next].sort((a, b) => a.key.localeCompare(b.key))
  writeJson(path.join(stateDir, 'quarantine.json'), { version: 1, cases, updatedAt: at })
  return { postmortem, quarantine: next }
}

function parseArgs(args) {
  const result = {}
  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.*)$/)
    if (match) result[match[1]] = match[2]
  }
  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2))
  const result = recordPostmortem({
    key: args.key,
    category: args.category,
    rootCause: args.rootCause,
    earliestCatchPoint: args.earliestCatchPoint,
    impact: args.impact,
    proposedImprovement: args.proposedImprovement,
    benchmarkEvidence: args.benchmarkEvidence,
    disposition: args.disposition,
    pr: args.pr,
    commit: args.commit,
  })
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}
