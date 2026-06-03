import fs from 'node:fs'
import path from 'node:path'

const manifestPath = path.join(process.cwd(), 'ops', 'agent-review', 'artifact-manifest.json')

export function writeArtifactManifest(payload = {}) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })

  const manifest = {
    generated_at: new Date().toISOString(),
    artifacts: payload.artifacts || [],
    workflow: payload.workflow || 'unknown',
    compound_count: payload.compound_count || 0,
    notes: payload.notes || [],
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  return manifest
}
