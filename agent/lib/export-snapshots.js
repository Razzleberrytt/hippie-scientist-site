import fs from 'node:fs'
import path from 'node:path'

const snapshotDir = path.join(process.cwd(), 'ops', 'agent-review', 'snapshots')

export function writeExportSnapshot(name = 'snapshot', payload = {}) {
  fs.mkdirSync(snapshotDir, { recursive: true })

  const file = path.join(snapshotDir, `${Date.now()}-${name}.json`)

  fs.writeFileSync(file, JSON.stringify(payload, null, 2))

  return file
}
