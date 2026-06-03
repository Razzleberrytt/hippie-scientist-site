import fs from 'node:fs'
import path from 'node:path'

const snapshotPath = path.join(process.cwd(), 'ops', 'agent-review', 'queue-snapshots.json')

export function saveQueueSnapshot(queue = []) {
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })

  const payload = {
    generated_at: new Date().toISOString(),
    queue,
  }

  fs.writeFileSync(snapshotPath, JSON.stringify(payload, null, 2))

  return payload
}
