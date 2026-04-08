import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

type SourceRef = { title: string; url?: string }
type Entity = Record<string, unknown>

type CsvRow = Record<string, string>

const ROOT = process.cwd()
const LEGACY_CSV_CANDIDATES = [
  '/home/oai/share/psychoactive_herbs_enriched_full.csv',
  '/home/oai/share/psychoactive_herbs_enriched_full 3.csv',
  '/mnt/data/psychoactive_herbs_enriched_full.csv',
  '/tmp/psychoactive_herbs_enriched_full.csv',
]

const HERBS_PATH = path.join(ROOT, 'public/data/herbs.json')
const COMPOUNDS_PATH = path.join(ROOT, 'public/data/compounds.json')

const nowIso = new Date().toISOString()

function resolveCsvCandidates() {
  const portableCandidates = [
    process.env.HERBS_CSV_PATH,
    path.join(ROOT, 'data-sources', 'herbs.csv'),
    path.join(ROOT, 'data-sources', 'psychoactive_herbs_enriched_full.csv'),
    path.join(ROOT, 'public', 'data', 'herbs_source.csv'),
  ]

  const candidates = [...portableCandidates, ...LEGACY_CSV_CANDIDATES].filter(
    (value): value is string => Boolean(value && value.trim())
  )

  return Array.from(new Set(candidates))
}

function norm(value: unknown) {
  return String(value ?? '').trim()
}

function splitList(value: unknown) {
  return norm(value)
    .split(/\||;|,|•|\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

function parseCsv(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: 'greedy',
  })

  if (parsed.errors.length) {
    console.warn(`[convert-herbs-csv] parse warnings for ${filePath}:`, parsed.errors.slice(0, 3))
  }

  return parsed.data.map(row => {
    const out: CsvRow = {}
    for (const [k, v] of Object.entries(row ?? {})) {
      out[k.toLowerCase().trim()] = norm(v)
    }
    return out
  })
}

function pick(row: CsvRow, ...keys: string[]) {
  for (const key of keys) {
    const value = norm(row[key])
    if (value) return value
  }
  return ''
}

function asSources(value: string): SourceRef[] {
  return splitList(value).map(item => {
    if (/^https?:\/\//i.test(item)) return { title: item, url: item }
    const m = item.match(/(https?:\/\/\S+)/i)
    if (m) {
      return { title: item.replace(m[1], '').trim() || m[1], url: m[1] }
    }
    return { title: item }
  })
}

function entitySort(a: Entity, b: Entity) {
  const an = norm(a.commonName || a.common || a.name || a.latinName)
  const bn = norm(b.commonName || b.common || b.name || b.latinName)
  return an.localeCompare(bn)
}

function mergeArrays(existing: unknown, incoming: string[]) {
  const prior = Array.isArray(existing) ? existing.map(item => norm(item)).filter(Boolean) : []
  return unique([...prior, ...incoming])
}

function mergeSources(existing: unknown, incoming: SourceRef[]) {
  const prior = Array.isArray(existing)
    ? (existing as Array<Record<string, unknown>>)
        .map(item => ({ title: norm(item.title), url: norm(item.url) || undefined }))
        .filter(item => item.title)
    : []

  const map = new Map<string, SourceRef>()
  for (const item of [...prior, ...incoming]) {
    const key = `${item.title.toLowerCase()}|${(item.url || '').toLowerCase()}`
    if (!map.has(key)) map.set(key, item)
  }
  return Array.from(map.values())
}

function mergeEntity(existing: Entity | undefined, incoming: Entity): Entity {
  const base: Entity = { ...(existing || {}) }
  const out: Entity = { ...base }

  for (const [k, v] of Object.entries(incoming)) {
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && !v.trim()) continue
    if (Array.isArray(v) && v.length === 0) continue

    if (k === 'sources') {
      out.sources = mergeSources(base.sources, v as SourceRef[])
      continue
    }

    if (Array.isArray(v)) {
      out[k] = mergeArrays(base[k], v as string[])
      continue
    }

    const existingValue = base[k]
    if (!existingValue || (typeof existingValue === 'string' && !existingValue.trim())) {
      out[k] = v
    }
  }

  out.lastUpdated = nowIso
  return out
}

function createIncomingRow(row: CsvRow): { herb: Entity | null; compounds: Entity[] } {
  const name = pick(row, 'name', 'common', 'common_name', 'commonname')
  const latin = pick(row, 'latin', 'latin_name', 'scientific', 'scientific_name', 'latinname')
  const summary = pick(row, 'summary', 'description', 'overview')
  const category = pick(row, 'category', 'class', 'type')
  const intensity = pick(row, 'intensity', 'intensity_level')
  const mechanism = pick(row, 'mechanism', 'mechanismofaction', 'mechanism_of_action')
  const activeCompounds = splitList(
    pick(row, 'activecompounds', 'active_compounds', 'constituents', 'compounds')
  )
  const effects = splitList(pick(row, 'effects', 'effect_profile'))
  const contraindications = splitList(pick(row, 'contraindications', 'warnings'))
  const safetyNotes = pick(row, 'safetynotes', 'safety_notes', 'safety')
  const sources = asSources(pick(row, 'sources', 'references', 'citations'))

  const herb =
    name || latin
      ? {
          id: pick(row, 'id') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          kind: 'herb',
          commonName: name,
          latinName: latin,
          summary,
          description: summary,
          category,
          class: category,
          intensity,
          mechanism,
          activeCompounds,
          effects,
          contraindications,
          safetyNotes,
          sources,
        }
      : null

  const compounds = activeCompounds.map(compound => ({
    id: compound.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    kind: 'compound',
    commonName: compound,
    latinName: compound,
    summary: `${compound} is listed as an active constituent in ${name || latin || 'an herb profile'}.`,
    mechanism,
    sources,
  }))

  return { herb, compounds }
}

function main() {
  const csvCandidates = resolveCsvCandidates()
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, 'utf8')) as Entity[]
  const compounds = JSON.parse(fs.readFileSync(COMPOUNDS_PATH, 'utf8')) as Entity[]

  const herbMap = new Map<string, Entity>()
  herbs.forEach(item => {
    const key = norm(item.id || item.commonName || item.name).toLowerCase()
    if (key) herbMap.set(key, item)
  })

  const compoundMap = new Map<string, Entity>()
  compounds.forEach(item => {
    const key = norm(item.id || item.commonName || item.name).toLowerCase()
    if (key) compoundMap.set(key, item)
  })

  let ingestedAnyCsv = false

  for (const csvPath of csvCandidates) {
    if (!fs.existsSync(csvPath)) {
      console.warn(`[convert-herbs-csv] missing CSV, skipping: ${csvPath}`)
      continue
    }

    ingestedAnyCsv = true
    const rows = parseCsv(csvPath)
    for (const row of rows) {
      const { herb, compounds: parsedCompounds } = createIncomingRow(row)

      if (herb) {
        const key = norm(herb.id || herb.commonName || herb.name).toLowerCase()
        herbMap.set(key, mergeEntity(herbMap.get(key), herb))
      }

      for (const compound of parsedCompounds) {
        const key = norm(compound.id || compound.commonName || compound.name).toLowerCase()
        compoundMap.set(key, mergeEntity(compoundMap.get(key), compound))
      }
    }
  }

  if (!ingestedAnyCsv) {
    console.warn(
      '[convert-herbs-csv] no source CSV found; skipping dataset merge and leaving existing public/data JSON unchanged.'
    )
    return
  }

  const mergedHerbs = Array.from(herbMap.values()).sort(entitySort)
  const mergedCompounds = Array.from(compoundMap.values()).sort(entitySort)

  fs.writeFileSync(HERBS_PATH, `${JSON.stringify(mergedHerbs, null, 2)}\n`, 'utf8')
  fs.writeFileSync(COMPOUNDS_PATH, `${JSON.stringify(mergedCompounds, null, 2)}\n`, 'utf8')

  console.log(
    `[convert-herbs-csv] wrote ${mergedHerbs.length} herbs and ${mergedCompounds.length} compounds`
  )
}

main()
