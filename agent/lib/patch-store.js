import fs from 'node:fs'
import path from 'node:path'

function safeJson(data) {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return '{}'
  }
}

export function writePatch({ slug, sourceAgent, patchId, data }) {
  const date = new Date().toISOString().slice(0, 10)
  const dir = path.join(process.cwd(), 'agent', 'patches', date)

  fs.mkdirSync(dir, { recursive: true })

  const safeSlug = String(slug || 'unknown').replace(/[^a-z0-9-]/gi, '-')
  const safeAgent = String(sourceAgent || 'agent').replace(/[^a-z0-9-]/gi, '-')

  const fileName = `${safeSlug}-${safeAgent}-${patchId}.json`

  fs.writeFileSync(path.join(dir, fileName), safeJson(data))

  return path.join(dir, fileName)
}
