import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const stateDir = path.join(repoRoot, 'ops', 'enrichment-governor')

const specs = {
  'state.json': value => value && value.version === 1 && typeof value.mode === 'string',
  'scoreboard.json': value => value && value.version === 1 && value.totals && typeof value.totals === 'object' && value.recurringBlockers && typeof value.recurringBlockers === 'object',
  'work-queue.json': value => value && value.version === 1 && Array.isArray(value.leases) && Array.isArray(value.queued) && Array.isArray(value.batched) && Array.isArray(value.blocked),
  'quarantine.json': value => value && value.version === 1 && Array.isArray(value.cases),
  'self-improvements.json': value => value && value.version === 1 && ['experimental', 'adopted', 'rejected', 'reverted'].every(key => Array.isArray(value[key])),
  'integrity-watch.json': value => value && value.version === 1 && Array.isArray(value.sources),
}

export function validateGovernorState(dir = stateDir) {
  const errors = []
  for (const [name, validate] of Object.entries(specs)) {
    const file = path.join(dir, name)
    if (!fs.existsSync(file)) {
      errors.push(`${name}:missing`)
      continue
    }
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (!validate(value)) errors.push(`${name}:invalid_shape`)
    } catch (error) {
      errors.push(`${name}:invalid_json:${error.message}`)
    }
  }

  const ledger = path.join(dir, 'ledger.jsonl')
  if (!fs.existsSync(ledger)) errors.push('ledger.jsonl:missing')
  else {
    for (const [index, line] of fs.readFileSync(ledger, 'utf8').split(/\r?\n/).filter(Boolean).entries()) {
      try {
        const event = JSON.parse(line)
        if (!event.event || !event.at) errors.push(`ledger.jsonl:${index + 1}:missing_event_or_at`)
      } catch (error) {
        errors.push(`ledger.jsonl:${index + 1}:invalid_json:${error.message}`)
      }
    }
  }

  return { ok: errors.length === 0, errors }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateGovernorState()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  if (!result.ok) process.exitCode = 1
}
