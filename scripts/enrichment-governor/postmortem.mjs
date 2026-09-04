import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { contract } from './governor.mjs'
import { reconcileQueueWithQuarantine } from './queue-resilience.mjs'
import { appendJsonl, atomicJson, loadJsonStrict, stateDir, withWriterLock } from './state-io.mjs'

export function recordPostmortem(input) {
  if (!input?.key || !input?.rootCause) throw new Error('postmortem requires key and rootCause')
  return withWriterLock(() => {
    const at = input.at || new Date().toISOString()
    const now = Date.parse(at)
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

    const quarantine = loadJsonStrict(path.join(stateDir, 'quarantine.json'), { version: 1, cases: [] })
    const queue = loadJsonStrict(path.join(stateDir, 'work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
    const existing = (quarantine.cases || []).find(row => row.key === input.key)
    const next = {
      ...(existing || { key: input.key, consecutiveFailures: 0 }),
      consecutiveFailures: Number(existing?.consecutiveFailures || 0) + 1,
      lastFailureAt: at,
      lastRootCause: input.rootCause,
      releasedAt: null,
      releaseMaterialChange: null,
    }
    const provisional = {
      ...quarantine,
      cases: [...(quarantine.cases || []).filter(row => row.key !== input.key), next],
    }
    const reconciled = reconcileQueueWithQuarantine(queue, provisional, contract.quarantine, now)
    const refreshedCase = reconciled.quarantine.cases.find(row => row.key === input.key)

    atomicJson(path.join(stateDir, 'quarantine.json'), { ...reconciled.quarantine, updatedAt: at })
    atomicJson(path.join(stateDir, 'work-queue.json'), { ...reconciled.queue, updatedAt: at })
    appendJsonl(path.join(stateDir, 'postmortems.jsonl'), postmortem)
    appendJsonl(path.join(stateDir, 'ledger.jsonl'), {
      event: 'postmortem_recorded',
      at,
      key: input.key,
      category: postmortem.category,
      disposition: postmortem.disposition,
      quarantined: refreshedCase.quarantined,
    })
    if (refreshedCase.quarantined) {
      appendJsonl(path.join(stateDir, 'ledger.jsonl'), {
        event: 'work_quarantined',
        at,
        key: input.key,
        source: 'postmortem',
        releaseAt: refreshedCase.releaseAt || null,
        reviewEligible: Boolean(refreshedCase.reviewEligible),
      })
    }
    return { postmortem, quarantine: refreshedCase, queueMetrics: reconciled.metrics }
  })
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
