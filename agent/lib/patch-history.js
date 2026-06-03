import fs from 'node:fs'
import path from 'node:path'

const historyPath = path.join(process.cwd(), 'ops', 'agent-review', 'patch-history.json')

export function appendPatchHistory(entry = {}) {
  fs.mkdirSync(path.dirname(historyPath), { recursive: true })

  const current = fs.existsSync(historyPath)
    ? JSON.parse(fs.readFileSync(historyPath, 'utf8'))
    : []

  current.push({
    timestamp: new Date().toISOString(),
    ...entry,
  })

  fs.writeFileSync(historyPath, JSON.stringify(current, null, 2))

  return current
}
