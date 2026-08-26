import fs from 'node:fs'
import path from 'node:path'

const rmOptions = { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }

export function cleanProductionBuildArtifacts(root = process.cwd()) {
  const outPath = path.join(root, 'out')
  const nextPath = path.join(root, '.next')

  if (fs.existsSync(outPath)) fs.rmSync(outPath, rmOptions)
  if (!fs.existsSync(nextPath)) return

  for (const entry of fs.readdirSync(nextPath)) {
    if (entry === 'cache') continue
    fs.rmSync(path.join(nextPath, entry), rmOptions)
  }
}
