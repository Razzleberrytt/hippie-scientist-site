#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const HERBS_PATH = path.join(DATA_DIR, 'herbs.json')
const COMPOUNDS_PATH = path.join(DATA_DIR, 'compounds.json')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'source-bootstrap-candidates.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'source-bootstrap-coverage.json')

const asText = value => String(value ?? '').trim()

function normalizeSourceEntries(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap(item => normalizeSourceEntries(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    const text = asText(value)
    return text ? [text] : []
  }
  if (typeof value === 'object') {
    return [value.url, value.title, value.name, value.citation, value.reference]
      .flatMap(candidate => normalizeSourceEntries(candidate))
      .filter(Boolean)
  }
  return []
}

function sourceCount(entity) {
  const sources = Array.isArray(entity?.sources) ? entity.sources : []
  return normalizeSourceEntries(sources).length
}

function slugify(value) {
  return asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function encodeQuery(value) {
  return encodeURIComponent(asText(value).replace(/\s+/g, ' ').trim())
}

function herbName(entity) {
  return asText(entity?.latin || entity?.scientific || entity?.name || entity?.commonName)
}

function compoundName(entity) {
  return asText(entity?.name || entity?.displayName || entity?.id || entity?.slug)
}

function herbCandidates(entity) {
  const name = herbName(entity)
  const slug = slugify(name)
  const q = encodeQuery(name)

  return [
    {
      title: `NCBI Taxonomy search: ${name}`,
      url: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=${q}`,
      note: 'Bootstrap identity source (tier: high)',
      tier: 'high',
    },
    {
      title: `Kew POWO search: ${name}`,
      url: `https://powo.science.kew.org/results?q=${q}`,
      note: 'Bootstrap botanical identity source (tier: medium)',
      tier: 'medium',
    },
    {
      title: `PubMed search: ${name}`,
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`,
      note: 'Bootstrap context source (tier: medium)',
      tier: 'medium',
    },
    {
      title: `Wikipedia: ${name}`,
      url: `https://en.wikipedia.org/wiki/${slug}`,
      note: 'Bootstrap fallback identity source (tier: fallback)',
      tier: 'fallback',
    },
  ]
}

function compoundCandidates(entity) {
  const name = compoundName(entity)
  const q = encodeQuery(name)
  const slug = slugify(name)

  return [
    {
      title: `PubChem compound search: ${name}`,
      url: `https://pubchem.ncbi.nlm.nih.gov/#query=${q}`,
      note: 'Bootstrap compound identity source (tier: high)',
      tier: 'high',
    },
    {
      title: `PubMed search: ${name}`,
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`,
      note: 'Bootstrap compound context source (tier: medium)',
      tier: 'medium',
    },
    {
      title: `MedlinePlus search: ${name}`,
      url: `https://medlineplus.gov/?searchterm=${q}`,
      note: 'Bootstrap broad health context source (tier: medium)',
      tier: 'medium',
    },
    {
      title: `Wikipedia: ${name}`,
      url: `https://en.wikipedia.org/wiki/${slug}`,
      note: 'Bootstrap fallback identity/context source (tier: fallback)',
      tier: 'fallback',
    },
  ]
}

function firstViableCandidate(candidates) {
  return candidates.find(candidate => asText(candidate.url).startsWith('http')) || null
}

function ensureArraySources(entity) {
  if (!Array.isArray(entity.sources)) entity.sources = []
  return entity.sources
}

function run() {
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(COMPOUNDS_PATH, 'utf8'))

  const before = {
    herbsZeroSources: herbs.filter(entity => sourceCount(entity) === 0).length,
    compoundsZeroSources: compounds.filter(entity => sourceCount(entity) === 0).length,
  }

  const touchedHerbs = []
  const touchedCompounds = []
  const cache = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-bootstrap-v1',
    herbCandidates: [],
    compoundCandidates: [],
  }

  for (const herb of herbs) {
    if (sourceCount(herb) > 0) continue
    const candidates = herbCandidates(herb)
    const chosen = firstViableCandidate(candidates)
    if (!chosen) continue
    ensureArraySources(herb).push({ title: chosen.title, url: chosen.url, note: chosen.note })
    touchedHerbs.push(asText(herb.slug || herb.id || herb.name || herb.latin))
    cache.herbCandidates.push({
      entity: asText(herb.slug || herb.id || herb.name || herb.latin),
      name: herbName(herb),
      selected: chosen,
      candidates,
    })
  }

  for (const compound of compounds) {
    if (sourceCount(compound) > 0) continue
    const candidates = compoundCandidates(compound)
    const chosen = firstViableCandidate(candidates)
    if (!chosen) continue
    ensureArraySources(compound).push({ title: chosen.title, url: chosen.url, note: chosen.note })
    touchedCompounds.push(asText(compound.slug || compound.id || compound.name))
    cache.compoundCandidates.push({
      entity: asText(compound.slug || compound.id || compound.name),
      name: compoundName(compound),
      selected: chosen,
      candidates,
    })
  }

  const after = {
    herbsZeroSources: herbs.filter(entity => sourceCount(entity) === 0).length,
    compoundsZeroSources: compounds.filter(entity => sourceCount(entity) === 0).length,
  }

  fs.writeFileSync(HERBS_PATH, `${JSON.stringify(herbs, null, 2)}\n`, 'utf8')
  fs.writeFileSync(COMPOUNDS_PATH, `${JSON.stringify(compounds, null, 2)}\n`, 'utf8')
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true })
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-bootstrap-v1',
    sources: {
      herbs: path.relative(ROOT, HERBS_PATH),
      compounds: path.relative(ROOT, COMPOUNDS_PATH),
      cache: path.relative(ROOT, CACHE_PATH),
    },
    summary: {
      herbsZeroSourcesBefore: before.herbsZeroSources,
      herbsZeroSourcesAfter: after.herbsZeroSources,
      compoundsZeroSourcesBefore: before.compoundsZeroSources,
      compoundsZeroSourcesAfter: after.compoundsZeroSources,
      herbsGainingAtLeastOneSource: touchedHerbs.length,
      compoundsGainingAtLeastOneSource: touchedCompounds.length,
    },
    touched: {
      herbs: touchedHerbs,
      compounds: touchedCompounds,
    },
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`[source-bootstrap] herbs zero sources: ${before.herbsZeroSources} -> ${after.herbsZeroSources}`)
  console.log(`[source-bootstrap] compounds zero sources: ${before.compoundsZeroSources} -> ${after.compoundsZeroSources}`)
  console.log(`[source-bootstrap] herbs gained >=1 source: ${touchedHerbs.length}`)
  console.log(`[source-bootstrap] compounds gained >=1 source: ${touchedCompounds.length}`)
  console.log(`[source-bootstrap] cache: ${path.relative(ROOT, CACHE_PATH)}`)
  console.log(`[source-bootstrap] report: ${path.relative(ROOT, REPORT_PATH)}`)
}

run()
