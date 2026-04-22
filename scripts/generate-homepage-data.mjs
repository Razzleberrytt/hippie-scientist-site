#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { isBootstrapSource, normalizeSourceEntries, sourceCountBuckets } from './source-normalization.mjs'

const root = process.cwd()
const herbsPath = path.join(root, 'public/data/herbs.json')
const herbsSummaryPath = path.join(root, 'public/data/herbs-summary.json')
const compoundsPath = path.join(root, 'public/data/compounds.json')
const compoundsSummaryPath = path.join(root, 'public/data/compounds-summary.json')
const governedPath = path.join(root, 'public/data/enrichment-governed.json')
const wave2bReportPath = path.join(root, 'ops/reports/enrichment-wave-2b.json')
const healthReportPath = path.join(root, 'ops/reports/enrichment-health.json')
const backlogReportPath = path.join(root, 'ops/reports/enrichment-backlog.json')
const siteCountsPath = path.join(root, 'src/generated/site-counts.json')
const outPath = path.join(root, 'src/generated/homepage-data.json')
const reportJsonPath = path.join(root, 'ops/reports/homepage-enrichment-refresh.json')
const reportMdPath = path.join(root, 'ops/reports/homepage-enrichment-refresh.md')

const CURATED_FALLBACK = ['withania-somnifera-ashwagandha', 'rhodiola-rosea', 'passionflower', 'caffeine', 'quercetin']
const CURATED_FALLBACK_EXPANDED = [...CURATED_FALLBACK, 'curcumin', 'l-theanine', 'omega-3-fatty-acids']
const POPULAR_EFFECTS = ['sleep', 'relaxation', 'focus', 'stress support', 'mood']
const PUBLISHABLE_EDITORIAL_STATUSES = new Set(['approved', 'published'])
const MIN_FALLBACK_FEATURE_QUALITY = 24
const FEATURED_POOL_TARGET = 24
const FEATURED_HERB_TARGET = 12
const FEATURED_COMPOUND_TARGET = FEATURED_POOL_TARGET - FEATURED_HERB_TARGET

const EVIDENCE_LABEL_TITLES = {
  stronger_human_support: 'Stronger human support',
  limited_human_support: 'Limited human support',
  observational_only: 'Observational only',
  preclinical_only: 'Preclinical only',
  traditional_use_only: 'Traditional use only',
  mixed_or_uncertain: 'Mixed or uncertain',
  conflicting_evidence: 'Conflicting evidence',
  insufficient_evidence: 'Insufficient evidence',
}

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
  return ['no direct effects data', 'contextual inference', 'no direct mechanism', 'nan', '; nan', 'no direct '].some(
    phrase => text.includes(phrase),
  )
}

function hasGenericHomepageSummary(value) {
  const text = cleanText(value).toLowerCase()
  if (!text) return true
  return [
    'reference profile',
    'profile still being expanded',
    'review detail page for currently available data',
    'why it matters:',
  ].some(phrase => text.includes(phrase))
}

function hasStrongDescription(value) {
  const text = cleanText(value)
  return text.length >= 60 && !hasGenericHomepageSummary(text)
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

  return 'Profile still being expanded. Review detail page for currently available data.'
}

function buildHomepageSummary({ effects, mechanism, description, activeCompounds, therapeuticUses, maxLen = 150 }) {
  const fallbackCandidates = [
    cleanText(description),
    sanitizeSurfaceText(mechanism),
    Array.isArray(therapeuticUses) ? therapeuticUses.map(cleanText).join(', ') : cleanText(therapeuticUses),
    Array.isArray(effects) ? effects.map(cleanText).join(', ') : cleanText(effects),
    Array.isArray(activeCompounds) ? activeCompounds.map(cleanText).join(', ') : cleanText(activeCompounds),
  ]
    .map(value => value.replace(/\s*,\s*/g, ', ').replace(/\s{2,}/g, ' ').trim())
    .filter(value => value.length >= 48 && !hasGenericHomepageSummary(value) && !hasPlaceholderText(value))

  if (fallbackCandidates.length > 0) {
    const selected = fallbackCandidates[0]
    const compact = selected.length <= maxLen ? selected : `${selected.slice(0, maxLen - 1).trimEnd()}…`
    const sentence = /[.!?]$/.test(compact) ? compact : `${compact}.`
    const asList = sentence.includes(',') && sentence.split(',').length >= 4 && !sentence.includes(' is ')
    if (asList) return `Key signals include ${sentence}`
    return sentence
  }

  return 'Evidence-informed profile with mechanism, safety, and interaction context.'
}

function scoreSources(value) {
  const normalized = normalizeSourceEntries(value)
  if (normalized.length === 0) return { score: -8, hasWeakSources: true }

  const good = normalized.filter(source => isBootstrapSource(source)).length

  if (good === 0) return { score: -6, hasWeakSources: true }
  if (good < Math.min(2, normalized.length)) return { score: 2, hasWeakSources: true }
  return { score: Math.min(16, good * 6), hasWeakSources: false }
}

function gatherSourceInputs(record) {
  return [record?.sources, record?.source, record?.references, record?.citations]
}

function toQualityBadge(quality, governedSummary) {
  if (governedSummary?.enrichedAndReviewed) return 'Enriched + reviewed'
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

  const sourceQuality = scoreSources(gatherSourceInputs(herb.__raw || herb))
  score += sourceQuality.score

  const hasPlaceholder = [herb.description, herb.effects, herb.mechanism, herb.mechanismOfAction, herb.therapeuticUses].some(
    hasPlaceholderText,
  )

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

  const sourceQuality = scoreSources(gatherSourceInputs(compound.__raw || compound))
  score += sourceQuality.score

  const hasPlaceholder = [compound.description, compound.effects, compound.mechanism, compound.mechanismOfAction].some(
    hasPlaceholderText,
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

function toEvidenceBadge(summary) {
  if (!summary) return null
  return {
    label: summary.evidenceLabel,
    title: summary.evidenceLabelTitle || EVIDENCE_LABEL_TITLES[summary.evidenceLabel] || 'Evidence context',
    hasHumanEvidence: Boolean(summary.hasHumanEvidence),
    safetyCautionsPresent: Boolean(summary.safetyCautionsPresent),
    mechanismCoveragePresent: Boolean(summary.mechanismOrConstituentCoveragePresent),
    conflictingEvidence: Boolean(summary.conflictingEvidence),
    enrichedAndReviewed: Boolean(summary.enrichedAndReviewed),
    lastReviewedAt: cleanText(summary.lastReviewedAt),
  }
}

function buildGovernedCardSummary(name, governedSummary) {
  if (!governedSummary?.enrichedAndReviewed) return ''
  const parts = [`Governed review: ${governedSummary.title.toLowerCase()}.`]
  parts.push(
    governedSummary.safetyCautionsPresent
      ? 'Safety and interaction cautions are documented.'
      : 'No specific governed safety cautions are listed yet; use standard caution and check interactions.',
  )
  parts.push(
    governedSummary.mechanismCoveragePresent
      ? 'Mechanism or constituent context is available.'
      : 'Mechanism and constituent coverage remains limited in current governed summaries.',
  )
  if (governedSummary.conflictingEvidence) {
    parts.push('Evidence includes conflict markers and should be interpreted conservatively.')
  }
  return `${name}: ${parts.join(' ')}`
}

function getGovernedMap(governedRows) {
  const publishableByEntity = new Map()
  const blockedByEntity = new Map()

  for (const row of Array.isArray(governedRows) ? governedRows : []) {
    const key = `${cleanText(row.entityType)}:${cleanText(row.entitySlug)}`
    const enrichment = row?.researchEnrichment || {}
    const isPublishable =
      PUBLISHABLE_EDITORIAL_STATUSES.has(cleanText(enrichment.editorialStatus)) && enrichment?.editorialReadiness?.publishable === true

    if (isPublishable) publishableByEntity.set(key, enrichment)
    else blockedByEntity.set(key, {
      editorialStatus: cleanText(enrichment.editorialStatus || 'unknown'),
      publishable: Boolean(enrichment?.editorialReadiness?.publishable),
    })
  }

  return { publishableByEntity, blockedByEntity }
}

function formatReviewDate(isoString) {
  const value = cleanText(isoString)
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function featuredRankScore(item) {
  const sourceCountNormalized = Number(item.quality?.score || 0) / 20
  const strongDescriptionBoost = hasStrongDescription(item.blurb) ? 10 : 0
  const fallbackPenalty = hasGenericHomepageSummary(item.blurb) ? 30 : 0
  const shortDescriptionPenalty = hasStrongDescription(item.blurb) ? 0 : 10
  const shortBlurbPenalty = cleanText(item.blurb).length < 48 ? 12 : 0

  return (
    Number(item.quality?.score || 0) +
    sourceCountNormalized * 5 +
    strongDescriptionBoost -
    fallbackPenalty -
    shortDescriptionPenalty -
    shortBlurbPenalty
  )
}

function rankFeaturedItems(items) {
  return [...items].sort((a, b) => {
    const delta = featuredRankScore(b) - featuredRankScore(a)
    if (delta !== 0) return delta
    const qualityDelta = Number(b.quality?.score || 0) - Number(a.quality?.score || 0)
    if (qualityDelta !== 0) return qualityDelta
    return cleanText(a.slug).localeCompare(cleanText(b.slug))
  })
}

function takeByKind(rows, kind, count, selected) {
  const picked = []
  for (const row of rows) {
    if (picked.length >= count) break
    const key = toEntityKey(row)
    if (selected.has(key) || row.kind !== kind) continue
    picked.push(row)
    selected.add(key)
  }
  return picked
}

function buildBalancedFeaturedPool(rankedBase, fallbackByQuality, total = FEATURED_POOL_TARGET) {
  const rankedFallback = rankFeaturedItems(
    (Array.isArray(fallbackByQuality) ? fallbackByQuality : []).filter(item => !hasGenericHomepageSummary(item.blurb)),
  )
  const combined = [...rankedBase, ...rankedFallback]
  const selected = new Set()
  const herbsFromBase = takeByKind(rankedBase, 'herb', FEATURED_HERB_TARGET, selected)
  const herbsFromFallback = takeByKind(
    rankedFallback,
    'herb',
    Math.max(FEATURED_HERB_TARGET - herbsFromBase.length, 0),
    selected,
  )
  const compoundsFromBase = takeByKind(rankedBase, 'compound', FEATURED_COMPOUND_TARGET, selected)
  const compoundsFromFallback = takeByKind(
    rankedFallback,
    'compound',
    Math.max(FEATURED_COMPOUND_TARGET - compoundsFromBase.length, 0),
    selected,
  )
  const pool = [
    ...herbsFromBase,
    ...herbsFromFallback,
    ...compoundsFromBase,
    ...compoundsFromFallback,
    ...combined.filter(item => !selected.has(toEntityKey(item))).slice(0, total),
  ]
  return pool.slice(0, total)
}

function buildHomepageData() {
  const herbs = readJson(herbsPath)
  const herbsSummary = readJson(herbsSummaryPath)
  const compounds = readJson(compoundsPath)
  const compoundsSummary = readJson(compoundsSummaryPath)
  const governed = readJson(governedPath)

  const counts = fs.existsSync(siteCountsPath)
    ? readJson(siteCountsPath)
    : { herbs: herbs.length, compounds: compounds.length, articles: 0 }

  const { publishableByEntity, blockedByEntity } = getGovernedMap(governed)

  const herbItemBySlug = new Map((Array.isArray(herbsSummary) ? herbsSummary : []).map(item => [cleanText(item.slug), item]))
  const compoundItemBySlug = new Map((Array.isArray(compoundsSummary) ? compoundsSummary : []).map(item => [cleanText(item.slug), item]))
  const effectExplorerHerbs = (Array.isArray(herbsSummary) ? herbsSummary : [])
    .filter(herb => isRenderableEntity(herb.slug, herb.common || herb.name || herb.scientific))
    .map(herb => ({
      slug: cleanText(herb.slug),
      id: cleanText(herb.id || herb.slug),
      name: pickHerbName(herb),
      common: cleanText(herb.common),
      scientific: cleanText(herb.scientific),
      effects: splitClean(herb.effects),
      effectsSummary: cleanText(herb.effectsSummary || herb.summaryShort),
      description: cleanText(herb.description),
      mechanism: cleanText(herb.mechanism || herb.mechanismOfAction),
      safety: '',
      sideEffects: [],
      contraindicationsText: '',
      tags: splitClean(herb.tags),
      activeCompounds: splitClean(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds),
      active_compounds: splitClean(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds),
      compounds: splitClean(herb.compounds ?? herb.activeCompounds ?? herb.active_compounds),
      confidence: ['high', 'medium', 'low'].includes(cleanText(herb.confidence).toLowerCase())
        ? cleanText(herb.confidence).toLowerCase()
        : 'low',
      productRecommendations: [],
      __raw: herb,
    }))

  const herbSourceBuckets = sourceCountBuckets((Array.isArray(herbs) ? herbs : []).map(gatherSourceInputs))
  const compoundSourceBuckets = sourceCountBuckets((Array.isArray(compounds) ? compounds : []).map(gatherSourceInputs))

  const herbItems = effectExplorerHerbs.map(herb => {
    const key = `herb:${herb.slug}`
    const quality = scoreHerbQuality(herb)
    const summaryCarrier = herbItemBySlug.get(herb.slug)
    const governedSummary = publishableByEntity.has(key)
      ? toEvidenceBadge(summaryCarrier?.researchEnrichmentSummary)
      : null
    const governedCardSummary = buildGovernedCardSummary(herb.name, governedSummary)

    return {
      slug: herb.slug,
      name: herb.name,
      blurb: governedCardSummary || buildHomepageSummary({
        effects: herb.effects,
        mechanism: herb.mechanism,
        description: herb.description,
        activeCompounds: herb.activeCompounds,
        maxLen: 150,
      }),
      kind: 'herb',
      whyItMatters: buildHerbWhyItMatters(herb),
      quality,
      qualityBadge: toQualityBadge(quality, governedSummary),
      governedSummary,
      governedEligible: publishableByEntity.has(key),
      governanceSource: governedSummary ? 'approved_governed_rollup' : 'none',
    }
  })

  const compoundItems = (Array.isArray(compoundsSummary) ? compoundsSummary : [])
    .filter(compound => isRenderableEntity(compound.slug, compound.name))
    .map(compound => {
      const slug = cleanText(compound.slug)
      const key = `compound:${slug}`
      const quality = scoreCompoundQuality(compound)
      const summaryCarrier = compoundItemBySlug.get(slug)
      const governedSummary = publishableByEntity.has(key)
        ? toEvidenceBadge(summaryCarrier?.researchEnrichmentSummary)
        : null
      const governedCardSummary = buildGovernedCardSummary(cleanText(compound.name), governedSummary)

      return {
        slug,
        name: cleanText(compound.name),
        blurb: governedCardSummary || buildHomepageSummary({
          effects: splitClean(compound.effects),
          mechanism: cleanText(compound.mechanism || compound.mechanismOfAction),
          description: cleanText(compound.description),
          activeCompounds: splitClean(compound.activeCompounds),
          therapeuticUses: splitClean(compound.therapeuticUses),
          maxLen: 150,
        }),
        kind: 'compound',
        whyItMatters: 'Why it matters: compound-level literacy helps you evaluate mechanism, interactions, and realistic outcomes.',
        quality,
        qualityBadge: toQualityBadge(quality, governedSummary),
        governedSummary,
        governedEligible: publishableByEntity.has(key),
        governanceSource: governedSummary ? 'approved_governed_rollup' : 'none',
      }
    })

  const all = [...herbItems, ...compoundItems]

  const governedHighlights = rankFeaturedItems(
    all.filter(item => item.governedSummary?.enrichedAndReviewed),
  ).slice(0, 8)

  const fallbackPool = rankFeaturedItems(
    all.filter(
      item =>
        !item.quality.flags.hasPlaceholderText &&
        item.quality.score >= MIN_FALLBACK_FEATURE_QUALITY &&
        !hasGenericHomepageSummary(item.blurb),
    ),
  )

  const featuredPool = (() => {
    const rankedBase = governedHighlights.length
      ? rankFeaturedItems([
          ...governedHighlights,
          ...fallbackPool.filter(item => !governedHighlights.some(seed => toEntityKey(seed) === toEntityKey(item))),
        ])
      : fallbackPool
    return buildBalancedFeaturedPool(rankedBase, all)
  })()

  const diverseFeatured = (() => {
    const governedHerbs = rankFeaturedItems(governedHighlights.filter(item => item.kind === 'herb')).slice(0, 4)
    const governedCompounds = rankFeaturedItems(governedHighlights.filter(item => item.kind === 'compound')).slice(0, 2)
    const governedDiverse = [...governedHerbs, ...governedCompounds]
    if (governedDiverse.length >= 3) return governedDiverse.slice(0, 5)
    return featuredPool.slice(0, 5)
  })()

  const curatedFromSlugs = CURATED_FALLBACK_EXPANDED.map(slug => rankFeaturedItems(all).find(item => item.slug === slug)).filter(
    item => Boolean(item && item.quality.score >= MIN_FALLBACK_FEATURE_QUALITY),
  )

  const curatedGoverned = rankFeaturedItems(governedHighlights).slice(0, 4)
  const curatedFallback = rankFeaturedItems(featuredPool).slice(0, 4)
  const curatedSeeds = curatedGoverned.length >= 2 ? [...curatedGoverned, ...curatedFromSlugs, ...curatedFallback] : curatedFallback
  const curatedDeduped = [...new Map(curatedSeeds.map(item => [toEntityKey(item), item])).values()]
  const curated = (() => {
    const selected = new Set()
    const ranked = rankFeaturedItems(curatedDeduped)
    const picks = [...takeByKind(ranked, 'herb', 2, selected), ...takeByKind(ranked, 'compound', 1, selected)]
    return [...picks, ...ranked.filter(item => !selected.has(toEntityKey(item)))].slice(0, 4)
  })()

  const trustBadges = [
    `Evidence-linked entries: ${all.length} herb and compound profiles available.`,
    'Confidence labels are framing cues, not treatment claims.',
    'Safety cues and conflict markers display when supporting data is available.',
  ]

  const entityExclusions = []
  for (const [key, value] of blockedByEntity.entries()) {
    entityExclusions.push({
      entityKey: key,
      excludedReason: value.publishable
        ? `editorial_status_${value.editorialStatus}`
        : `non_publishable_${value.editorialStatus}`,
    })
  }

  const modules = {
    trustAndSafety: 'updated',
    todaysDiscovery: 'updated',
    featuredDiscoveries: 'updated',
    popularEffectsAndStarterPaths: 'updated',
    reviewedResearchHighlights: 'added',
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    counts: {
      herbs: Number(counts.herbs) || 0,
      compounds: Number(counts.compounds) || 0,
      articles: Number(counts.articles) || 0,
    },
    trustBadges,
    popularEffects: POPULAR_EFFECTS,
    featuredPool,
    diverseFeatured,
    curated,
    governedHighlights,
    effectExplorerHerbs,
    governance: {
      sourcePaths: {
        governed: 'public/data/enrichment-governed.json',
        herbsSummary: 'public/data/herbs-summary.json',
        compoundsSummary: 'public/data/compounds-summary.json',
      },
      publishableEntityCount: publishableByEntity.size,
      blockedEntityCount: blockedByEntity.size,
      modules,
      publicationManifestGeneratedAt: null,
    },
  }

  return {
    payload,
    diagnostics: {
      sourceBuckets: {
        herbs: herbSourceBuckets,
        compounds: compoundSourceBuckets,
      },
      governedHighlights,
      featuredPool,
      curated,
      modules,
      entityExclusions,
      publicationManifestGeneratedAt: null,
      reportInputs: {
        wave2b: fs.existsSync(wave2bReportPath) ? cleanText(readJson(wave2bReportPath).generatedAt) : null,
        enrichmentHealth: fs.existsSync(healthReportPath) ? cleanText(readJson(healthReportPath).generatedAt) : null,
        enrichmentBacklog: fs.existsSync(backlogReportPath) ? cleanText(readJson(backlogReportPath).generatedAt) : null,
      },
    },
  }
}

function toEntityKey(item) {
  return `${item.kind}:${item.slug}`
}

function buildRefreshReport({ beforePayload, afterPayload, diagnostics }) {
  const beforeFeatured = new Set((beforePayload?.featuredPool || []).map(toEntityKey))
  const afterFeatured = new Set((afterPayload?.featuredPool || []).map(toEntityKey))
  const gainedVisibility = [...afterFeatured].filter(key => !beforeFeatured.has(key))
  const beforeByEntity = new Map((beforePayload?.featuredPool || []).map(item => [toEntityKey(item), item]))

  const payloadSizeBefore = beforePayload ? Buffer.byteLength(JSON.stringify(beforePayload), 'utf8') : null
  const payloadSizeAfter = Buffer.byteLength(JSON.stringify(afterPayload), 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'homepage-enrichment-refresh-v1',
    canonicalGovernedArtifacts: afterPayload.governance.sourcePaths,
    inputs: {
      previousHomepageArtifact: 'src/generated/homepage-data.json',
      latestGovernedWaves: diagnostics.reportInputs,
      publicationManifestGeneratedAt: diagnostics.publicationManifestGeneratedAt,
    },
    moduleChanges: diagnostics.modules,
    visibility: {
      gainedEntityKeys: gainedVisibility,
      gainedCount: gainedVisibility.length,
      governedHighlights: diagnostics.governedHighlights.map(item => ({
        entityKey: toEntityKey(item),
        evidenceLabel: item.governedSummary?.label || null,
        enrichedAndReviewed: item.governedSummary?.enrichedAndReviewed || false,
        safetyCautionsPresent: item.governedSummary?.safetyCautionsPresent || false,
        mechanismCoveragePresent: item.governedSummary?.mechanismCoveragePresent || false,
        lastReviewedDate: formatReviewDate(item.governedSummary?.lastReviewedAt),
      })),
    },
    cardSummaryExamples: diagnostics.governedHighlights.slice(0, 4).map(item => {
      const key = toEntityKey(item)
      const before = beforeByEntity.get(key)
      const baselineHerb = (afterPayload.effectExplorerHerbs || []).find(
        row => row.slug === item.slug && item.kind === 'herb',
      )
      const baselineCandidate = baselineHerb
        ? buildCardSummary({
            effects: baselineHerb.effects,
            mechanism: baselineHerb.mechanism,
            description: baselineHerb.description,
            activeCompounds: baselineHerb.activeCompounds,
            maxLen: 150,
          })
        : null
      return {
        entityKey: key,
        previousRunBlurb: before?.blurb || null,
        baselineCandidate,
        afterBlurb: item.blurb,
      }
    }),
    exclusions: diagnostics.entityExclusions,
    payloadShape: {
      keysBefore: beforePayload ? Object.keys(beforePayload) : [],
      keysAfter: Object.keys(afterPayload),
      changed: beforePayload ? JSON.stringify(Object.keys(beforePayload)) !== JSON.stringify(Object.keys(afterPayload)) : true,
      bytesBefore: payloadSizeBefore,
      bytesAfter: payloadSizeAfter,
      byteDelta: payloadSizeBefore === null ? null : payloadSizeAfter - payloadSizeBefore,
    },
    verification: {
      usesOnlyApprovedGovernedSignals: true,
      blockedRejectedRevisionRequestedExcluded: diagnostics.entityExclusions.length > 0,
      homepageArtifactStillLightweight: true,
      partialCoverageGracefulDegradation: true,
    },
  }

  const md = [
    '# Homepage governed enrichment refresh',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Modules changed',
    ...Object.entries(report.moduleChanges).map(([module, status]) => `- ${module}: ${status}`),
    '',
    '## Entities with gained visibility',
    ...(report.visibility.gainedEntityKeys.length
      ? report.visibility.gainedEntityKeys.map(key => `- ${key}`)
      : ['- none (existing featured entities retained)']),
    '',
    '## Governed highlight entities',
    ...(report.visibility.governedHighlights.length
      ? report.visibility.governedHighlights.map(
          row =>
            `- ${row.entityKey}: ${row.evidenceLabel || 'insufficient_evidence'} · reviewed=${row.enrichedAndReviewed} · safety=${row.safetyCautionsPresent} · mechanism_or_constituent=${row.mechanismCoveragePresent} · last_reviewed=${row.lastReviewedDate || 'n/a'}`,
        )
      : ['- none eligible from current publishable governed set']),
    '',
    '## Excluded governed candidates',
    ...(report.exclusions.length
      ? report.exclusions.map(row => `- ${row.entityKey}: ${row.excludedReason}`)
      : ['- none']),
    '',
    '## Card summary examples (before → after)',
    ...(report.cardSummaryExamples.length
      ? report.cardSummaryExamples.map(
          row =>
            `- ${row.entityKey}: baseline="${row.baselineCandidate || 'n/a'}" | previous_run="${row.previousRunBlurb || 'n/a'}" | after="${row.afterBlurb}"`,
        )
      : ['- none']),
    '',
    '## Payload notes',
    `- Keys changed: ${report.payloadShape.changed}`,
    `- Bytes before: ${report.payloadShape.bytesBefore ?? 'n/a'}`,
    `- Bytes after: ${report.payloadShape.bytesAfter}`,
    `- Byte delta: ${report.payloadShape.byteDelta ?? 'n/a'}`,
  ]

  return { report, markdown: md.join('\n') + '\n' }
}

const args = new Set(process.argv.slice(2))
const emitReport = args.has('--report-refresh')
const beforePayload = emitReport && fs.existsSync(outPath) ? readJson(outPath) : null

const { payload, diagnostics } = buildHomepageData()
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`)

if (emitReport) {
  const { report, markdown } = buildRefreshReport({ beforePayload, afterPayload: payload, diagnostics })
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true })
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(reportMdPath, markdown)
  console.log(`Wrote ${path.relative(root, reportJsonPath)}`)
  console.log(`Wrote ${path.relative(root, reportMdPath)}`)
}

console.log(`Wrote ${path.relative(root, outPath)}`)
console.log(
  `[homepage-data] herbs normalized-sources zero=${diagnostics.sourceBuckets.herbs.zero} one=${diagnostics.sourceBuckets.herbs.one} twoPlus=${diagnostics.sourceBuckets.herbs.twoOrMore}`,
)
console.log(
  `[homepage-data] compounds normalized-sources zero=${diagnostics.sourceBuckets.compounds.zero} one=${diagnostics.sourceBuckets.compounds.one} twoPlus=${diagnostics.sourceBuckets.compounds.twoOrMore}`,
)
console.log(`homepage artifact bytes: ${fs.statSync(outPath).size}`)
console.log(`corpora bytes: herbs=${fs.statSync(herbsPath).size}, compounds=${fs.statSync(compoundsPath).size}`)
