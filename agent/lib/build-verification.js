import fs from 'node:fs'
import path from 'node:path'

export function verifyPatchDirectories() {
  const dirs = [
    path.join(process.cwd(), 'agent', 'patches'),
    path.join(process.cwd(), 'ops', 'agent-review'),
  ]

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true })
  }

  return true
}

export function verifyPatchIntegrity(patches = []) {
  return patches.every(patch => {
    return (
      patch &&
      patch.slug &&
      patch.patch_id &&
      patch.source_agent
    )
  })
}
