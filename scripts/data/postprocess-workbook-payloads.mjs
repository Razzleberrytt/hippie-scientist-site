import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'public/data')
const herbSourcesCachePath = path.join(process.cwd(), 'ops/cache/pubmed-herb-sources-cache.json')

function readHerbSourcesCache() {
  if (!fs.existsSync(herbSourcesCachePath)) return {}

  try {
    const parsed = JSON.parse(fs.readFileSync(herbSourcesCachePath, 'utf-8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

const herbSourcesCache = readHerbSourcesCache()

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

function patchDetailDir(dirName) {
  const fullDir = path.join(dataDir, dirName)
  if (!fs.existsSync(fullDir)) return

  let count = 0
  for (const entry of fs.readdirSync(fullDir)) {
    if (!entry.endsWith('.json')) continue
    const full = path.join(fullDir, entry)
    const json = JSON.parse(fs.readFileSync(full, 'utf-8'))
    if (Array.isArray(json.sources)) continue
    const slug = json.slug || entry.replace(/\.json$/, '')
    json.sources = ensureArray(json.sources || json.references || herbSourcesCache[slug] || [])
    fs.writeFileSync(full, JSON.stringify(json, null, 2) + '\n')
    count += 1
  }

  console.log(`[data-postprocess] normalized ${count} ${dirName} detail records`)
}

patchDetailDir('herb-detail')
patchDetailDir('herbs-detail')
