#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const herbsPath = path.join(root, 'public/data/herbs.json')
const compoundsPath = path.join(root, 'public/data/compounds.json')
const siteCountsPath = path.join(root, 'src/generated/site-counts.json')
const outPath = path.join(root, 'src/generated/homepage-data.json')

const CURATED_FALLBACK = [
  'withania-somnifera-ashwagandha',
  'rhodiola-rosea',
  'passionflower',
  'caffeine',
  'quercetin',
]

const TRUST_BADGES = [
  'Built for educational exploration of herbs, compounds, and mechanisms.',
  'We prioritize contraindications, interaction context, and conservative framing.',
  'Not medical advice. Talk with a qualified clinician for personal guidance.',
]

const POPULAR_EFFECTS = ['sleep', 'relaxation', 'focus', 'stress support', 'mood']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitClean(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean)
  const raw = cleanText(value)
  if (!raw) return []
  return raw
    .split(/[;,|\n]+/g)
    .map(part => cleanText(part))
    .filter(Boolean)
}

const INVALID_ENTITY_VALUES = new Set(['', 'nan', 'null', 'undefined', 'n/a', 'na', '-', 'unknown'])

function isValidEntityValue(value) {
  return !INVALID_ENTITY_VALUES.has(cleanText(value).toLowerCase())
}

function isRenderableEntity(slug, name) {
  return isValidEntityValue(slug) && isValidEntityValue(name)
}

function sanitizeSurfaceText(value) {
  return cleanText(value)
    .replace(/\s*(?:[;|]+|\.{3,})\s*/g, '. ')
    .replace(/\s+([,.;:!?])/g, '$1')
}

function hasPlaceholderText(value) {
  const text = String(value || '').toLowerCase()
  if (!text) return false
  return [
    'no direct effects data',
    'contextual inference',
    'no direct mechanism',
    'nan',
    '; nan',
    'no direct ',
  ].some(phrase => text.includes(phrase))
}

function buildCardSummary({ effects, mechanism, description, activeCompounds, therapeuticUses, maxLen = 150 }) {
  const listText = value => {
    if (Array.isArray(value)) return value.map(sanitizeSurfaceText).filter(Boolean).join(', ')
    return sanitizeSurfaceText(value)
  }

  const shorten = text => (text.length <= maxLen ? text : `${text.slice(0, maxLen - 1).trimEnd()}…`)

  const candidates = [
    listText(effects),
    sanitizeSurfaceText(mechanism),
    sanitizeSurfaceText(description),
    listText(activeCompounds),
    listText(therapeuticUses),
  ]

  const best = candidates.find(candidate => candidate && candidate.length >= 24)
  if (best) return shorten(best)

  const firstUsable = candidates.find(Boolean)
  if (firstUsable) return shorten(firstUsable)

  return 'Profile still being expanded. Review detail page for currently verified data.'
}

function scoreSources(value) {
  if (!Array.isArray(value) || value.length === 0) return { score: -8, hasWeakSources: true }
  const normalized = value
    .map(item => {
      if (typeof item === 'string') return cleanText(item)
      if (!item || typeof item !== 'object') return null
      return { title: cleanText(item.title), url: cleanText(item.url) }
    })
    .filter(Boolean)

  const good = normalized.filter(source => {
    if (typeof source === 'string') return /^https?:\/\//i.test(source) || source.length > 12
    return source.title.length > 8 && /^https?:\/\//i.test(source.url)
  }).length

  if (good === 0) return { score: -6, hasWeakSources: true }
  if (good < Math.min(2, normalized.length)) return { score: 2, hasWeakSources: true }
  return { score: Math.min(16, good * 6), hasWeakSources: false }
}

function toQualityBadge(quality) {
  if (quality.flags.isIncomplete) return 'Incomplete'
  if (quality.flags.hasWeakSources) return 'Needs sources'
  return 'High confidence'
}

function scoreHerbQuality(herb) {
  const corePresent = [
    sanitizeSurfaceText(herb.name || herb.common),
    sanitizeSurfaceText(herb.scientific || herb.latin),
    sanitizeSurfaceText(herb.description),
    sanitizeSurfaceText(herb.class || herb.category),
  ].filter(Boolean).length

  let score = 0
  score += corePresent * 8
  if (splitClean(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds).length > 0) score += 10
  if (splitClean(herb.effects).length > 0) score += 12
  if (sanitizeSurfaceText(herb.mechanism || herb.mechanismOfAction).length >= 30) score += 12
  if (splitClean(herb.contraindications).length > 0) score += 8
  if (splitClean(herb.interactions).length > 0) score += 8
  if (sanitizeSurfaceText(herb.description).length >= 70) score += 8

  const sourceQuality = scoreSources(herb.sources)
  score += sourceQuality.score

  const hasPlaceholder = [
    herb.description,
    herb.effects,
    herb.mechanism,
    herb.mechanismOfAction,
    herb.therapeuticUses,
  ].some(hasPlaceholderText)

  if (hasPlaceholder) score -= 35
  if (sanitizeSurfaceText(herb.description).length < 24) score -= 12

  return {
    score,
    flags: {
      isIncomplete: corePresent < 3 || score < 34,
      hasPlaceholderText: hasPlaceholder,
      hasWeakSources: sourceQuality.hasWeakSources,
    },
  }
}

function scoreCompoundQuality(compound) {
  let score = 0
  if (sanitizeSurfaceText(compound.name).length > 1) score += 10
  if (sanitizeSurfaceText(compound.category || compound.className || compound.class).length > 1) score += 8
  if (splitClean(compound.herbs).length > 0) score += 8
  if (splitClean(compound.effects).length > 0) score += 12
  if (sanitizeSurfaceText(compound.mechanism || compound.mechanismOfAction).length >= 24) score += 12
  if (splitClean(compound.contraindications).length > 0) score += 8
  if (splitClean(compound.interactions).length > 0) score += 6
  if (sanitizeSurfaceText(compound.description).length >= 50) score += 8

  const sourceQuality = scoreSources(compound.sources)
  score += sourceQuality.score

  const hasPlaceholder = [compound.description, compound.effects, compound.mechanism, compound.mechanismOfAction].some(
    hasPlaceholderText
  )

  if (hasPlaceholder) score -= 35

  return {
    score,
    flags: {
      isIncomplete: score < 24,
      hasPlaceholderText: hasPlaceholder,
      hasWeakSources: sourceQuality.hasWeakSources,
    },
  }
}

function sortByScore(items) {
  return [...items].sort((a, b) => b.quality.score - a.quality.score)
}

function pickHerbName(herb) {
  return cleanText(herb.common || herb.name || herb.scientific || herb.slug || 'Herb')
}

function buildHerbWhyItMatters(herb) {
  const name = pickHerbName(herb)
  return `${name} matters because understanding its mechanism and risks helps people make lower-risk, evidence-aware decisions.`
}

function buildHomepageData() {
  const herbs = readJson(herbsPath)
  const compounds = readJson(compoundsPath)
  const counts = fs.existsSync(siteCountsPath)
    ? readJson(siteCountsPath)
    : { herbs: herbs.length, compounds: compounds.length, articles: 0 }

  const effectExplorerHerbs = (Array.isArray(herbs) ? herbs : [])
    .filter(herb => isRenderableEntity(herb.slug, herb.common || herb.name || herb.scientific))
    .map(herb => ({
      slug: cleanText(herb.slug),
      id: cleanText(herb.id || herb.slug),
      name: pickHerbName(herb),
      common: cleanText(herb.common),
      scientific: cleanText(herb.scientific),
      effects: splitClean(herb.effects),
      effectsSummary: cleanText(herb.effectsSummary),
      description: cleanText(herb.description),
      mechanism: cleanText(herb.mechanism || herb.mechanismOfAction),
      safety: cleanText(herb.safety || herb.sideEffects || herb.contraindicationsText),
      sideEffects: splitClean(herb.sideEffects ?? herb.sideeffects),
      contraindicationsText: cleanText(herb.contraindicationsText),
      tags: splitClean(herb.tags),
      activeCompounds: splitClean(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds),
      active_compounds: splitClean(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds),
      compounds: splitClean(herb.compounds ?? herb.activeCompounds ?? herb.active_compounds),
      confidence: ['high', 'medium', 'low'].includes(cleanText(herb.confidence).toLowerCase())
        ? cleanText(herb.confidence).toLowerCase()
        : 'low',
      productRecommendations: Array.isArray(herb.productRecommendations)
        ? herb.productRecommendations.slice(0, 2).map(item => ({
            label: cleanText(item?.label),
            type: cleanText(item?.type),
            url: cleanText(item?.url),
          }))
        : [],
    }))

  const herbItems = effectExplorerHerbs.map(herb => {
    const quality = scoreHerbQuality(herb)
    return {
      slug: herb.slug,
      name: herb.name,
      blurb: buildCardSummary({
        effects: herb.effects,
        mechanism: herb.mechanism,
        description: herb.description,
        activeCompounds: herb.activeCompounds,
        maxLen: 150,
      }),
      kind: 'herb',
      whyItMatters: buildHerbWhyItMatters(herb),
      quality,
      qualityBadge: toQualityBadge(quality),
    }
  })

  const compoundItems = (Array.isArray(compounds) ? compounds : [])
    .filter(compound => isRenderableEntity(compound.slug, compound.name))
    .map(compound => {
      const quality = scoreCompoundQuality(compound)
      return {
        slug: cleanText(compound.slug),
        name: cleanText(compound.name),
        blurb: buildCardSummary({
          effects: splitClean(compound.effects),
          mechanism: cleanText(compound.mechanism || compound.mechanismOfAction),
          description: cleanText(compound.description),
          activeCompounds: splitClean(compound.activeCompounds),
          therapeuticUses: splitClean(compound.therapeuticUses),
          maxLen: 150,
        }),
        kind: 'compound',
        whyItMatters:
          'Why it matters: compound-level literacy helps you evaluate mechanism, interactions, and realistic outcomes.',
        quality,
        qualityBadge: toQualityBadge(quality),
      }
    })

  const all = [...herbItems, ...compoundItems]
  const highQuality = all.filter(
    item => item.quality.score >= 34 && !item.quality.flags.isIncomplete && !item.quality.flags.hasPlaceholderText
  )

  const fallbackPool = sortByScore(all.filter(item => !item.quality.flags.hasPlaceholderText && item.quality.score >= 24))

  const featuredPool = highQuality.length ? highQuality : fallbackPool
  const diverseFeatured = (() => {
    if (highQuality.length >= 5) {
      const herbsTop = sortByScore(highQuality.filter(item => item.kind === 'herb')).slice(0, 3)
      const compoundsTop = sortByScore(highQuality.filter(item => item.kind === 'compound')).slice(0, 2)
      return [...herbsTop, ...compoundsTop]
    }
    return fallbackPool.slice(0, 5)
  })()

  const curatedFromSlugs = CURATED_FALLBACK.map(slug => sortByScore(all).find(item => item.slug === slug)).filter(
    item => Boolean(item && item.quality.score >= 24)
  )

  const curatedFallback = sortByScore(featuredPool).slice(0, 3)
  const curated = (curatedFromSlugs.length >= 3 ? curatedFromSlugs : curatedFallback).slice(0, 3)

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      herbs: Number(counts.herbs) || 0,
      compounds: Number(counts.compounds) || 0,
      articles: Number(counts.articles) || 0,
    },
    trustBadges: TRUST_BADGES,
    popularEffects: POPULAR_EFFECTS,
    featuredPool,
    diverseFeatured,
    curated,
    effectExplorerHerbs,
  }
}

const payload = buildHomepageData()
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, outPath)}`)
console.log(`homepage artifact bytes: ${fs.statSync(outPath).size}`)
console.log(`corpora bytes: herbs=${fs.statSync(herbsPath).size}, compounds=${fs.statSync(compoundsPath).size}`)
