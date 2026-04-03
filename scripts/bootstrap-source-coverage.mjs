#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const HERBS_PATH = path.join(DATA_DIR, 'herbs.json')
const COMPOUNDS_PATH = path.join(DATA_DIR, 'compounds.json')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'source-bootstrap-candidates.json')
const PRECISION_CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'source-precision-resolver-cache.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'source-bootstrap-coverage.json')
const PRECISION_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'source-precision-cleanup.json')

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

function toPubChemCompoundPage(name) {
  const slug = slugify(name)
  if (!slug) return ''
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${slug}`
}

function toPubChemCompoundPageByCid(cid) {
  const id = asText(cid)
  if (!/^\d+$/.test(id)) return ''
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${id}`
}

function toNcbiTaxonomyInfoByName(name) {
  const q = encodeQuery(name)
  if (!q) return ''
  return `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=${q}&mode=Info`
}

function toNcbiTaxonomyInfoById(id) {
  const value = asText(id)
  if (!/^\d+$/.test(value)) return ''
  return `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${value}&mode=Info`
}

function classifyUrl(url) {
  const text = asText(url)
  if (!text) return { isSearchOrFallback: false, isCanonicalEntity: false }
  const isSearchOrFallback =
    /#query=|[?&](q|query|term|searchterm|name)=|\/results\?/.test(text) ||
    /\/search\b/.test(text) ||
    /wikipedia\.org\//.test(text)
  const isCanonicalEntity =
    /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/[a-z0-9-]+\/?$/i.test(text) ||
    /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/\d+\/?$/i.test(text) ||
    /ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?(?=.*\bmode=Info\b)(?=.*\bname=)/i.test(text) ||
    /ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?(?=.*\bmode=Info\b)(?=.*\bid=)/i.test(text) ||
    /powo\.science\.kew\.org\/taxon\//i.test(text) ||
    /pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/?$/.test(text)
  return { isSearchOrFallback, isCanonicalEntity }
}

function isWeakNameDerivedUrl(url) {
  const text = asText(url)
  return (
    /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/[a-z0-9-]+\/?$/i.test(text) ||
    /ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?(?=.*\bname=)/i.test(text)
  )
}

function isStableIdUrl(url) {
  const text = asText(url)
  return (
    /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/\d+\/?$/i.test(text) ||
    /ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?(?=.*\bid=\d+)(?=.*\bmode=Info\b)/i.test(text) ||
    /powo\.science\.kew\.org\/taxon\//i.test(text)
  )
}

function precisionMetrics(herbs, compounds) {
  let searchOrFallback = 0
  let canonicalEntity = 0
  let weakNameDerived = 0
  let stableIdCanonical = 0
  for (const collection of [herbs, compounds]) {
    for (const entity of collection) {
      const sources = Array.isArray(entity?.sources) ? entity.sources : []
      for (const source of sources) {
        const url =
          typeof source === 'string'
            ? source
            : source && typeof source === 'object'
              ? source.url || source.reference || ''
              : ''
        const classification = classifyUrl(url)
        if (classification.isSearchOrFallback) searchOrFallback += 1
        if (classification.isCanonicalEntity) canonicalEntity += 1
        if (isWeakNameDerivedUrl(url)) weakNameDerived += 1
        if (isStableIdUrl(url)) stableIdCanonical += 1
      }
    }
  }
  return { searchOrFallback, canonicalEntity, weakNameDerived, stableIdCanonical }
}

function readJsonFromGitHead(relativePath) {
  try {
    const text = execSync(`git show HEAD:${relativePath}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    })
    return JSON.parse(text)
  } catch {
    return null
  }
}

function indexByEntity(collection, nameSelector) {
  const map = new Map()
  for (const entity of collection) {
    map.set(asText(entity?.slug || entity?.id || nameSelector(entity)), entity)
  }
  return map
}

function countHerbImprovements(beforeHerbs, afterHerbs) {
  const beforeByKey = indexByEntity(beforeHerbs, herbName)
  let improved = 0
  for (const herb of afterHerbs) {
    const key = asText(herb?.slug || herb?.id || herbName(herb))
    const previous = beforeByKey.get(key)
    if (!previous) continue
    const beforeUrls = new Set((previous.sources || []).map(source => asText(source?.url || source)))
    const afterUrls = new Set((herb.sources || []).map(source => asText(source?.url || source)))
    const hadWeak = [...beforeUrls].some(url => /Taxonomy\/Browser\/wwwtax\.cgi\?(?=.*\bname=)/i.test(url))
    const hasStableId = [...afterUrls].some(url => /Taxonomy\/Browser\/wwwtax\.cgi\?(?=.*\bid=\d+)(?=.*\bmode=Info\b)/i.test(url))
    if (hadWeak && hasStableId) improved += 1
  }
  return improved
}

function countCompoundImprovements(beforeCompounds, afterCompounds) {
  const beforeByKey = indexByEntity(beforeCompounds, compoundName)
  let improved = 0
  for (const compound of afterCompounds) {
    const key = asText(compound?.slug || compound?.id || compoundName(compound))
    const previous = beforeByKey.get(key)
    if (!previous) continue
    const beforeUrls = new Set((previous.sources || []).map(source => asText(source?.url || source)))
    const afterUrls = new Set((compound.sources || []).map(source => asText(source?.url || source)))
    const hadWeak = [...beforeUrls].some(url => /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/[a-z0-9-]+\/?$/i.test(url) || /pubchem\.ncbi\.nlm\.nih\.gov\/#query=/i.test(url))
    const hasStableId = [...afterUrls].some(url => /pubchem\.ncbi\.nlm\.nih\.gov\/compound\/\d+\/?$/i.test(url))
    if (hadWeak && hasStableId) improved += 1
  }
  return improved
}

function herbCandidates(entity) {
  const name = herbName(entity)
  const slug = slugify(name)
  const q = encodeQuery(name)
  const ncbiInfoUrl = toNcbiTaxonomyInfoByName(name)

  return [
    {
      title: `NCBI Taxonomy: ${name}`,
      url: ncbiInfoUrl || `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=${q}`,
      note: 'Bootstrap identity source (tier: high, canonical-by-name)',
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
  const pubChemCompoundUrl = toPubChemCompoundPage(name)

  return [
    {
      title: `PubChem compound: ${name}`,
      url: pubChemCompoundUrl || `https://pubchem.ncbi.nlm.nih.gov/#query=${q}`,
      note: 'Bootstrap compound identity source (tier: high, canonical-by-name)',
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

function readResolverCache() {
  if (!fs.existsSync(PRECISION_CACHE_PATH)) {
    return { generatedAt: null, herbTaxonomyIds: {}, compoundCids: {} }
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(PRECISION_CACHE_PATH, 'utf8'))
    return {
      generatedAt: parsed?.generatedAt || null,
      herbTaxonomyIds: parsed?.herbTaxonomyIds && typeof parsed.herbTaxonomyIds === 'object' ? parsed.herbTaxonomyIds : {},
      compoundCids: parsed?.compoundCids && typeof parsed.compoundCids === 'object' ? parsed.compoundCids : {},
    }
  } catch {
    return { generatedAt: null, herbTaxonomyIds: {}, compoundCids: {} }
  }
}

function writeResolverCache(cache) {
  const payload = {
    generatedAt: new Date().toISOString(),
    herbTaxonomyIds: cache.herbTaxonomyIds,
    compoundCids: cache.compoundCids,
  }
  fs.mkdirSync(path.dirname(PRECISION_CACHE_PATH), { recursive: true })
  fs.writeFileSync(PRECISION_CACHE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function requestJson(url) {
  try {
    const response = execSync(`curl -fsSL --max-time 20 ${JSON.stringify(url)}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 8 * 1024 * 1024,
    })
    return JSON.parse(response)
  } catch {
    return null
  }
}

function resolvePubChemCid(name, resolverCache) {
  const key = asText(name).toLowerCase()
  if (!key) return ''
  if (Object.prototype.hasOwnProperty.call(resolverCache.compoundCids, key)) {
    return asText(resolverCache.compoundCids[key])
  }
  const endpoint = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`
  const body = requestJson(endpoint)
  const cid = asText(body?.IdentifierList?.CID?.[0] ?? '')
  resolverCache.compoundCids[key] = /^\d+$/.test(cid) ? cid : ''
  return resolverCache.compoundCids[key]
}

function resolveNcbiTaxonomyId(name, resolverCache) {
  const key = asText(name).toLowerCase()
  if (!key) return ''
  if (Object.prototype.hasOwnProperty.call(resolverCache.herbTaxonomyIds, key)) {
    return asText(resolverCache.herbTaxonomyIds[key])
  }
  const term = `${name}[SCIN]`
  const endpoint = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=${encodeURIComponent(term)}&retmode=json&retmax=1`
  const body = requestJson(endpoint)
  const taxId = asText(body?.esearchresult?.idlist?.[0] ?? '')
  resolverCache.herbTaxonomyIds[key] = /^\d+$/.test(taxId) ? taxId : ''
  return resolverCache.herbTaxonomyIds[key]
}

function upgradeHerbSource(entity, resolverCache, examples) {
  const sources = ensureArraySources(entity)
  const name = herbName(entity)
  const taxonomyId = resolveNcbiTaxonomyId(name, resolverCache)
  const targetUrl = toNcbiTaxonomyInfoById(taxonomyId) || toNcbiTaxonomyInfoByName(name)
  if (!targetUrl) return false
  let changed = false
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue
    const url = asText(source.url)
    if (!/ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?/.test(url)) continue
    if (!/[?&]name=/.test(url)) continue
    if (asText(source.url) === targetUrl) continue
    const previousUrl = asText(source.url)
    source.url = targetUrl
    source.title = `NCBI Taxonomy: ${name}${taxonomyId ? ` (TaxID ${taxonomyId})` : ''}`
    source.note = taxonomyId
      ? 'Bootstrap identity source (tier: high, canonical-id)'
      : 'Bootstrap identity source (tier: high, canonical-by-name)'
    if (!changed && previousUrl !== targetUrl && isWeakNameDerivedUrl(previousUrl) && isStableIdUrl(targetUrl) && examples.herbs.length < 10) {
      examples.herbs.push({ herb: name, before: previousUrl, after: targetUrl })
    }
    changed = true
  }
  return changed
}

function upgradeCompoundSource(entity, resolverCache, examples) {
  const sources = ensureArraySources(entity)
  const name = compoundName(entity)
  const cid = resolvePubChemCid(name, resolverCache)
  const targetUrl = toPubChemCompoundPageByCid(cid) || toPubChemCompoundPage(name)
  if (!targetUrl) return false
  let changed = false
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue
    const url = asText(source.url)
    if (!/pubchem\.ncbi\.nlm\.nih\.gov\/(compound\/|#query=)/i.test(url)) continue
    if (asText(source.url) === targetUrl) continue
    const previousUrl = asText(source.url)
    source.url = targetUrl
    source.title = `PubChem compound: ${name}${cid ? ` (CID ${cid})` : ''}`
    source.note = cid
      ? 'Bootstrap compound identity source (tier: high, canonical-id)'
      : 'Bootstrap compound identity source (tier: high, canonical-by-name)'
    if (!changed && previousUrl !== targetUrl && isWeakNameDerivedUrl(previousUrl) && isStableIdUrl(targetUrl) && examples.compounds.length < 10) {
      examples.compounds.push({ compound: name, before: previousUrl, after: targetUrl })
    }
    changed = true
  }
  return changed
}

function run() {
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(COMPOUNDS_PATH, 'utf8'))
  const resolverCache = readResolverCache()
  const headHerbs = readJsonFromGitHead(path.relative(ROOT, HERBS_PATH)) || herbs
  const headCompounds = readJsonFromGitHead(path.relative(ROOT, COMPOUNDS_PATH)) || compounds
  const precisionBefore = precisionMetrics(headHerbs, headCompounds)
  const precisionExamples = { herbs: [], compounds: [] }

  const before = {
    herbsZeroSources: herbs.filter(entity => sourceCount(entity) === 0).length,
    compoundsZeroSources: compounds.filter(entity => sourceCount(entity) === 0).length,
  }

  const touchedHerbs = []
  const touchedCompounds = []
  let cache = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-bootstrap-v3',
    herbCandidates: [],
    compoundCandidates: [],
  }
  if (fs.existsSync(CACHE_PATH)) {
    try {
      const existingCache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
      if (existingCache && typeof existingCache === 'object') {
        cache = {
          ...cache,
          ...existingCache,
          herbCandidates: Array.isArray(existingCache.herbCandidates) ? existingCache.herbCandidates : [],
          compoundCandidates: Array.isArray(existingCache.compoundCandidates) ? existingCache.compoundCandidates : [],
        }
      }
    } catch {
      // keep fresh cache shape
    }
  }

  for (const herb of herbs) {
    upgradeHerbSource(herb, resolverCache, precisionExamples)
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
    upgradeCompoundSource(compound, resolverCache, precisionExamples)
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
  writeResolverCache(resolverCache)

  const after = {
    herbsZeroSources: herbs.filter(entity => sourceCount(entity) === 0).length,
    compoundsZeroSources: compounds.filter(entity => sourceCount(entity) === 0).length,
  }
  const precisionAfter = precisionMetrics(herbs, compounds)
  const herbsPrecisionUpgraded = countHerbImprovements(headHerbs, herbs)
  const compoundsPrecisionUpgraded = countCompoundImprovements(headCompounds, compounds)

  for (const candidate of cache.herbCandidates) {
    const name = asText(candidate?.name || candidate?.entity)
    const upgradedUrl = toNcbiTaxonomyInfoByName(name)
    if (!upgradedUrl) continue
    if (candidate.selected && /ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?/i.test(asText(candidate.selected.url))) {
      candidate.selected.url = upgradedUrl
      candidate.selected.title = `NCBI Taxonomy: ${name}`
      candidate.selected.note = 'Bootstrap identity source (tier: high, canonical-by-name)'
    }
    if (Array.isArray(candidate.candidates)) {
      for (const option of candidate.candidates) {
        if (!option || typeof option !== 'object') continue
        if (!/ncbi\.nlm\.nih\.gov\/Taxonomy\/Browser\/wwwtax\.cgi\?/i.test(asText(option.url))) continue
        option.url = upgradedUrl
        option.title = `NCBI Taxonomy: ${name}`
        option.note = 'Bootstrap identity source (tier: high, canonical-by-name)'
      }
    }
  }

  for (const candidate of cache.compoundCandidates) {
    const name = asText(candidate?.name || candidate?.entity)
    const upgradedUrl = toPubChemCompoundPage(name)
    if (!upgradedUrl) continue
    if (candidate.selected && /pubchem\.ncbi\.nlm\.nih\.gov\/#query=/i.test(asText(candidate.selected.url))) {
      candidate.selected.url = upgradedUrl
      candidate.selected.title = `PubChem compound: ${name}`
      candidate.selected.note = 'Bootstrap compound identity source (tier: high, canonical-by-name)'
    }
    if (Array.isArray(candidate.candidates)) {
      for (const option of candidate.candidates) {
        if (!option || typeof option !== 'object') continue
        if (!/pubchem\.ncbi\.nlm\.nih\.gov\/#query=/i.test(asText(option.url))) continue
        option.url = upgradedUrl
        option.title = `PubChem compound: ${name}`
        option.note = 'Bootstrap compound identity source (tier: high, canonical-by-name)'
      }
    }
  }

  fs.writeFileSync(HERBS_PATH, `${JSON.stringify(herbs, null, 2)}\n`, 'utf8')
  fs.writeFileSync(COMPOUNDS_PATH, `${JSON.stringify(compounds, null, 2)}\n`, 'utf8')
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true })
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-bootstrap-v3',
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
      searchOrFallbackBefore: precisionBefore.searchOrFallback,
      searchOrFallbackAfter: precisionAfter.searchOrFallback,
      canonicalEntityBefore: precisionBefore.canonicalEntity,
      canonicalEntityAfter: precisionAfter.canonicalEntity,
      weakNameDerivedBefore: precisionBefore.weakNameDerived,
      weakNameDerivedAfter: precisionAfter.weakNameDerived,
      stableIdCanonicalBefore: precisionBefore.stableIdCanonical,
      stableIdCanonicalAfter: precisionAfter.stableIdCanonical,
      herbsPrecisionUpgraded,
      compoundsPrecisionUpgraded,
    },
    touched: {
      herbs: touchedHerbs,
      compounds: touchedCompounds,
    },
    precisionExamples,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const precisionReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-bootstrap-v3',
    summary: {
      searchOrFallbackBefore: precisionBefore.searchOrFallback,
      searchOrFallbackAfter: precisionAfter.searchOrFallback,
      canonicalEntityBefore: precisionBefore.canonicalEntity,
      canonicalEntityAfter: precisionAfter.canonicalEntity,
      weakNameDerivedBefore: precisionBefore.weakNameDerived,
      weakNameDerivedAfter: precisionAfter.weakNameDerived,
      stableIdCanonicalBefore: precisionBefore.stableIdCanonical,
      stableIdCanonicalAfter: precisionAfter.stableIdCanonical,
      herbsImproved: herbsPrecisionUpgraded,
      compoundsImproved: compoundsPrecisionUpgraded,
    },
    examples: precisionExamples,
  }
  fs.writeFileSync(PRECISION_REPORT_PATH, `${JSON.stringify(precisionReport, null, 2)}\n`, 'utf8')

  console.log(`[source-bootstrap] herbs zero sources: ${before.herbsZeroSources} -> ${after.herbsZeroSources}`)
  console.log(`[source-bootstrap] compounds zero sources: ${before.compoundsZeroSources} -> ${after.compoundsZeroSources}`)
  console.log(`[source-bootstrap] herbs gained >=1 source: ${touchedHerbs.length}`)
  console.log(`[source-bootstrap] compounds gained >=1 source: ${touchedCompounds.length}`)
  console.log(`[source-bootstrap] cache: ${path.relative(ROOT, CACHE_PATH)}`)
  console.log(`[source-bootstrap] report: ${path.relative(ROOT, REPORT_PATH)}`)
  console.log(`[source-bootstrap] precision report: ${path.relative(ROOT, PRECISION_REPORT_PATH)}`)
}

run()
