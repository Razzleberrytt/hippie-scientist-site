import { contract } from './governor.mjs'
import { reconcileQueueWithQuarantine } from './queue-resilience.mjs'
import { appendJsonl, atomicJson, loadJsonStrict, statePath, withWriterLock } from './state-io.mjs'

const nowIso = now => new Date(now).toISOString()
const stable = value => JSON.stringify(value)

export function reconcilePersistentGovernorState({ now = Date.now(), write = true } = {}) {
  return withWriterLock(() => {
    const queue = loadJsonStrict(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
    const quarantine = loadJsonStrict(statePath('quarantine.json'), { version: 1, cases: [] })
    const reconciled = reconcileQueueWithQuarantine(queue, quarantine, contract.quarantine, now)
    const nextQueue = { ...reconciled.queue }
    const nextQuarantine = { ...reconciled.quarantine }
    delete nextQueue.updatedAt
    delete nextQuarantine.updatedAt
    const currentQueue = { ...queue }
    const currentQuarantine = { ...quarantine }
    delete currentQueue.updatedAt
    delete currentQuarantine.updatedAt
    const queueChanged = stable(nextQueue) !== stable(currentQueue)
    const quarantineChanged = stable(nextQuarantine) !== stable(currentQuarantine)
    const changed = queueChanged || quarantineChanged
    if (write && changed) {
      const at = nowIso(now)
      if (queueChanged) atomicJson(statePath('work-queue.json'), { ...nextQueue, updatedAt: at })
      if (quarantineChanged) atomicJson(statePath('quarantine.json'), { ...nextQuarantine, updatedAt: at })
      appendJsonl(statePath('ledger.jsonl'), { event: 'governor_state_reconciled', at, ...reconciled.metrics })
    }
    return { ok: true, changed, queueChanged, quarantineChanged, metrics: reconciled.metrics, activeLeases: (reconciled.queue.leases || []).length, queued: (reconciled.queue.queued || []).length, blocked: (reconciled.queue.blocked || []).length }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run')
  const result = reconcilePersistentGovernorState({ write: !dryRun })
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}
