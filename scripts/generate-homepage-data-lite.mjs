#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'public/data')
const generatedDir = path.join(root, 'src/generated')
const reportsDir = path.join(root, 'ops/reports')

const herbsPath = path.join(dataDir, 'herbs.json')
const herbsSummaryPath = path.join(dataDir, 'herbs-summary.json')
const compoundsPath = path.join(dataDir, 'compounds.json')
const compoundsSummaryPath = path.join(dataDir, 'compounds-summary.json')
const buildReportPath = path.join(dataDir, 'build-report.json')
const outPath = path.join(generatedDir, 'homepage-data.json')
const reportPath = path.join(reportsDir, 'homepage-data-lite-report.json')

const FEATURED_POOL_TARGET = 24
const FEATURED_HERB_TARGET = 12
const POPULAR_EFFECTS = ['sleep', 'relaxation', 'focus', 'stress support', 'mood']

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function splitClean(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean)
  const text = cleanText(value)
  if (!text) return []
  return text.split(/[;,|\n]+/g).map(cleanText).filter(Boolean)
}

function isUsable(value) {
  const text = cleanText(value).toLowerCase()
  return Boolean(text && !['nan', 'null', 'undefined', 'unknown', 'n/a', 'na', '-'].includes(text))
}

function isRenderableEntity(record) {
  return isUsable(record?.slug) && isUsable(record?.name)
}

function compactSentence(value, maxLen = 150) {
  const text = cleanText(value)
  if (!text) return ''
  const compact = text.length <= maxLen ? text : `${text.slice(0, maxLen - 1).trimEnd()}…`
  return /[.!?]$/.test(compact) ? compact : `${compact}.`
}

function buildBlurb(record) {
  const candidates = [
    record.summary,
    record.description,
    record.mechanism,
    record.mechanisms,
    record.safetyNotes,
    record.compoundClass,
    record.evidenceLevel,
  ]

  for (const candidate of candidates) {
    const text = Array.isArray(candidate) ? candidate.map(cleanText).join(', ') : cleanText(candidate)
    if (text.length >= 32) return compactSentence(text)
  }

  return 'Evidence-informed profile with mechanism, safety, and interaction context.'
}

function scoreRecord(record) {
  let score = 0
  if (isUsable(record.name)) score += 10
  if (isUsable(record.slug)) score += 10
  if (cleanText(record.summary).length >= 32) score += 12
  if (cleanText(record.description).length >= 60) score += 16
  if (splitClean(record.mechanisms).length > 0 || isUsable(record.mechanism)) score += 10
  if (splitClean(record.interactions).length > 0) score += 8
  if (splitClean(record.contraindications).length > 0) score += 8
  if (isUsable(record.safetyNotes)) score += 8
  if (Number(record.sourceCount || 0) > 0) score += Math.min(12, Number(record.sourceCount || 0) * 4)
  if (record.qualityTier === 'strong') score += 20
  if (record.qualityTier === 'publishable') score += 10
  return score
}

function toFeaturedItem(record, kind) {
  const qualityScore = scoreRecord(record)
  return {
    slug: cleanText(record.slug),
    name: cleanText(record.name),
    blurb: buildBlurb(record),
    kind,
    whyItMatters:
      kind === 'herb'
        ? `${cleanText(record.name)} matters because understanding its mechanism and risks helps people make lower-risk, evidence-aware decisions.`
        : 'Compound-level literacy helps you evaluate mechanism, interactions, and realistic outcomes.',
    quality: {
      score: qualityScore,
      flags: {
        isIncomplete: qualityScore < 34,
        hasPlaceholderText: false,
        hasWeakSources: Number(record.sourceCount || 0) <= 0,
      },
    },
    qualityBadge: qualityScore >= 60 ? 'High confidence' : qualityScore >= 34 ? 'Review-ready' : 'Incomplete',
    governedSummary: null,
    governedEligible: false,
    governanceSource: 'workbook_runtime',
  }
}

function rank(items) {
  return [...items].sort((a, b) => {
    const scoreDelta = Number(b.quality?.score || 0) - Number(a.quality?.score || 0)
    if (scoreDelta !== 0) return scoreDelta
    return cleanText(a.slug).localeCompare(cleanText(b.slug))
  })
}

function take(items, kind, count, selected) {
  const picked = []
  for (const item of items) {
    if (picked.length >= count) break
    const key = `${item.kind}:${item.slug}`
    if (item.kind !== kind || selected.has(key)) continue
    picked.push(item)
    selected.add(key)
  }
  return picked
}

function buildFeaturedPool(herbItems, compoundItems) {
  const selected = new Set()
  const rankedHerbs = rank(herbItems)
  const rankedCompounds = rank(compoundItems)
  const pickedHerbs = take(rankedHerbs, 'herb', FEATURED_HERB_TARGET, selected)
  const pickedCompounds = take(rankedCompounds, 'compound', FEATURED_POOL_TARGET - pickedHerbs.length, selected)
  const combined = rank([...herbItems, ...compoundItems])
  return [...pickedHerbs, ...pickedCompounds, ...combined.filter(item => !selected.has(`${item.kind}:${item.slug}`))].slice(0, FEATURED_POOL_TARGET)
}

function toEffectExplorerHerb(herb) {
  return {
    slug: cleanText(herb.slug),
    id: cleanText(herb.id || herb.slug),
    name: cleanText(herb.name),
    common: cleanText(herb.common || herb.name),
    scientific: cleanText(herb.scientific || herb.latin),
    effects: splitClean(herb.effects || herb.therapeuticUses || herb.mechanisms),
    effectsSummary: cleanText(herb.summary),
    description: cleanText(herb.description || herb.summary),
    mechanism: cleanText(herb.mechanism || (Array.isArray(herb.mechanisms) ? herb.mechanisms.join(', ') : herb.mechanisms)),
    safety: cleanText(herb.safetyNotes),
    sideEffects: splitClean(herb.sideEffects),
    contraindicationsText: splitClean(herb.contraindications).join(', '),
    tags: splitClean(herb.tags || herb.qualityTier),
    activeCompounds: splitClean(herb.activeCompounds || herb.compounds),
    active_compounds: splitClean(herb.activeCompounds || herb.compounds),
    compounds: splitClean(herb.compounds || herb.activeCompounds),
    confidence: cleanText(herb.confidenceTier).toLowerCase() || 'low',
    productRecommendations: [],
  }
}

function run() {
  const herbs = readJson(herbsPath, [])
  const herbsSummary = readJson(herbsSummaryPath, [])
  const compounds = readJson(compoundsPath, [])
  const compoundsSummary = readJson(compoundsSummaryPath, [])
  const buildReport = readJson(buildReportPath, null)

  const herbSource = Array.isArray(herbs) && herbs.length ? herbs : herbsSummary
  const compoundSource = Array.isArray(compounds) && compounds.length ? compounds : compoundsSummary

  const herbItems = herbSource.filter(isRenderableEntity).map(record => toFeaturedItem(record, 'herb'))
  const compoundItems = compoundSource.filter(isRenderableEntity).map(record => toFeaturedItem(record, 'compound'))

  const featuredPool = buildFeaturedPool(herbItems, compoundItems)
  const diverseFeatured = featuredPool.slice(0, 5)
  const curated = featuredPool.slice(0, 4)
  const governedHighlights = []
  const effectExplorerHerbs = herbSource.filter(isRenderableEntity).map(toEffectExplorerHerb)

  const counts = {
    herbs: buildReport?.totals?.publishableHerbs ?? herbItems.length,
    compounds: buildReport?.totals?.publishableCompounds ?? compoundItems.length,
    articles: 0,
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    counts,
    trustBadges: [
      `Evidence-linked entries: ${counts.herbs + counts.compounds} herb and compound profiles available.`,
      'Confidence labels are framing cues, not treatment claims.',
      'Safety cues and conflict markers display when supporting data is available.',
    ],
    popularEffects: POPULAR_EFFECTS,
    featuredPool,
    diverseFeatured,
    curated,
    governedHighlights,
    effectExplorerHerbs,
    governance: {
      sourcePaths: {
        workbookBuildReport: 'public/data/build-report.json',
        herbsSummary: 'public/data/herbs-summary.json',
        compoundsSummary: 'public/data/compounds-summary.json',
      },
      publishableEntityCount: counts.herbs + counts.compounds,
      blockedEntityCount: 0,
      modules: {
        trustAndSafety: 'workbook_runtime',
        todaysDiscovery: 'workbook_runtime',
        featuredDiscoveries: 'workbook_runtime',
        popularEffectsAndStarterPaths: 'workbook_runtime',
        reviewedResearchHighlights: 'not_available_without_governed_artifact',
      },
      publicationManifestGeneratedAt: null,
    },
  }

  const report = {
    generatedAt: payload.generatedAt,
    source: 'workbook_runtime_public_data',
    inputs: {
      herbs: herbSource.length,
      compounds: compoundSource.length,
      buildReportPresent: Boolean(buildReport),
    },
    outputs: {
      featuredPool: featuredPool.length,
      diverseFeatured: diverseFeatured.length,
      curated: curated.length,
      effectExplorerHerbs: effectExplorerHerbs.length,
    },
  }

  writeJson(outPath, payload)
  writeJson(reportPath, report)

  console.log(`[homepage-data] herbs=${herbItems.length}`)
  console.log(`[homepage-data] compounds=${compoundItems.length}`)
  console.log(`[homepage-data] featured=${featuredPool.length}`)
  console.log(`[homepage-data] wrote=${path.relative(root, outPath)}`)
}

run()
