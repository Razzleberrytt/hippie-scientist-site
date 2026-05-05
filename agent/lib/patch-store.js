import fs from 'node:fs'
import path from 'node:path'

export function writePatch({ slug, sourceAgent, patchId, data }) {
  const date = new Date().toISOString().slice(0, 10)
  const dir = path.join(process.cwd(), 'agent', 'patches', date)

  fs.mkdirSync(dir, { recursive: true })

  const fileName = `${slug}-${sourceAgent}-${patchId}.json`

  fs.writeFileSync(
    path.join(dir, fileName),
    JSON.stringify(data, null, 2)
  )
}
