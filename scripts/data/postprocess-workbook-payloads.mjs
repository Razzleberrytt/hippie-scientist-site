import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'public/data')

function ensureArray(v) {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function patchFile(file) {
  const full = path.join(dataDir, file)
  if (!fs.existsSync(full)) return

  const json = JSON.parse(fs.readFileSync(full, 'utf-8'))

  const patched = json.map((row) => ({
    ...row,
    summary: row.summary || row.coreInsight || 'No summary available yet.',
    effects: ensureArray(row.effects || row.primary_effects),
    safety: row.safety?.notes || row.safety || 'Generally well tolerated for most users.',
    sources: ensureArray(row.sources || row.references || [])
  }))

  fs.writeFileSync(full, JSON.stringify(patched, null, 2))
  console.log(`[data-postprocess] normalized ${file}`)
}

patchFile('compounds.json')
patchFile('herbs.json')
