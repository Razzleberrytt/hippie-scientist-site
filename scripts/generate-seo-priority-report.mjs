import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const ROOT = process.cwd()

const readJson = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return []
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
}

const readText = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

const toSet = value => new Set(Array.isArray(value) ? value : [])

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function parseSeoCollections() {
  const file = readText('src/data/seoCollections.ts')
  if (!file) return { collections: [], featuredSlugs: [] }

  const collectionsMatch = file.match(/export const SEO_COLLECTIONS:\s*SeoCollection\[\]\s*=\s*(\[[\s\S]*?\n\])/)
  const featuredMatch = file.match(/export const FEATURED_COLLECTION_SLUGS\s*=\s*(\[[\s\S]*?\])/)

  let collections = []
  let featuredSlugs = []

  try {
    if (collectionsMatch?.[1]) {
      collections = Function(`"use strict"; return (${collectionsMatch[1]});`)()
    }
    if (featuredMatch?.[1]) {
      featuredSlugs = Function(`"use strict"; return (${featuredMatch[1]});`)()
    }
  } catch {
    collections = []
    featuredSlugs = []
  }

  return {
    collections: Array.isArray(collections) ? collections : [],
    featuredSlugs: Array.isArray(featuredSlugs) ? featuredSlugs : [],
  }
}

function asList(value) {
  return Array.isArray(value) ? value : []
}

function makeBlob(fields = []) {
  return fields
    .flatMap(field => {
      if (Array.isArray(field)) return field
      if (typeof field === 'string') return field.split(/[^a-z0-9]+/i)
      return []
    })
    .map(token => String(token || '').trim().toLowerCase())
    .filter(Boolean)
    .join(' ')
}

function matchesAny(blob, terms = []) {
  if (!terms.length) return true
  return terms.some(term => blob.includes(String(term || '').toLowerCase()))
}

function filterHerbByCollection(herb, filters = {}) {
  const effectBlob = makeBlob([herb.effects, herb.description])
  const mechanismBlob = makeBlob([herb.mechanism, herb.mechanismOfAction])
  const interactionBlob = makeBlob([herb.interactionTags, herb.interactions, herb.tags])

  return (
    matchesAny(effectBlob, asList(filters.effectsAny)) &&
    matchesAny(mechanismBlob, asList(filters.mechanismAny)) &&
    matchesAny(interactionBlob, asList(filters.interactionTagsAny))
  )
}

function filterCompoundByCollection(compound, filters = {}) {
  const effectBlob = makeBlob([compound.effects, compound.description])
  const mechanismBlob = makeBlob([compound.mechanism])
  const interactionBlob = makeBlob([compound.interactionTags, compound.interactions, compound.category])

  return (
    matchesAny(effectBlob, asList(filters.effectsAny)) &&
    matchesAny(mechanismBlob, asList(filters.mechanismAny)) &&
    matchesAny(interactionBlob, asList(filters.interactionTagsAny))
  )
}

function filterComboByCollection(combo, filters = {}) {
  const goals = asList(filters.comboGoalsAny)
  const goalMatch = !goals.length || goals.includes(combo.goal)
  const nameMatch = matchesAny(String(combo.name || '').toLowerCase(), asList(filters.comboNameAny))
  const descriptionMatch = matchesAny(
    String(combo.description || '').toLowerCase(),
    asList(filters.comboDescriptionAny)
  )
  return goalMatch && (nameMatch || descriptionMatch)
}

function buildReport() {
  const today = new Date().toISOString().slice(0, 10)
  const publicationManifest = readJson('public/data/publication-manifest.json')
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')
  const combos = readJson('public/data/prebuiltCombos.json')
  const homepageData = readJson('src/generated/homepage-data.json')
  const { metadata } = getSharedRouteManifest()
  const { collections, featuredSlugs } = parseSeoCollections()

  const indexableHerbEntries = asList(publicationManifest?.entities?.herbs)
  const indexableCompoundEntries = asList(publicationManifest?.entities?.compounds)
  const indexableHerbRoutes = toSet(asList(publicationManifest?.routes?.herbs))
  const indexableCompoundRoutes = toSet(asList(publicationManifest?.routes?.compounds))

  const curatedHomepage = asList(homepageData?.curated)
  const featuredHomepage = asList(homepageData?.featuredPool)
  const diverseHomepage = asList(homepageData?.diverseFeatured)

  const homepageHerbProminence = new Map()
  const homepageCompoundProminence = new Map()

  const addHomepageSignal = (row, weight, source) => {
    if (!row || !row.slug) return
    const target = row.kind === 'compound' ? homepageCompoundProminence : homepageHerbProminence
    const prior = target.get(row.slug) || { score: 0, signals: new Set() }
    prior.score += weight
    prior.signals.add(source)
    target.set(row.slug, prior)
  }

  curatedHomepage.forEach(row => addHomepageSignal(row, 5, 'homepage:curated'))
  featuredHomepage.forEach(row => addHomepageSignal(row, 3, 'homepage:featured-pool'))
  diverseHomepage.forEach(row => addHomepageSignal(row, 2, 'homepage:diverse-pool'))

  const approvedCollections = asList(metadata?.indexableCollections)
  const approvedCollectionBySlug = new Map(approvedCollections.map(entry => [entry.slug, entry]))

  const herbCollectionMatches = new Map()
  const compoundCollectionMatches = new Map()

  for (const collection of collections) {
    if (!approvedCollectionBySlug.has(collection.slug)) continue
    if (collection.itemType === 'herb') {
      for (const herb of herbs) {
        if (!filterHerbByCollection(herb, collection.filters || {})) continue
        herbCollectionMatches.set(herb.slug, (herbCollectionMatches.get(herb.slug) || 0) + 1)
      }
    }
    if (collection.itemType === 'compound') {
      for (const compound of compounds) {
        if (!filterCompoundByCollection(compound, collection.filters || {})) continue
        compoundCollectionMatches.set(compound.slug, (compoundCollectionMatches.get(compound.slug) || 0) + 1)
      }
    }
  }

  const topHerbs = herbs
    .map(herb => {
      const route = `/herbs/${herb.slug}`
      const manifestRow = indexableHerbEntries.find(item => item.slug === herb.slug)
      const homepageSignal = homepageHerbProminence.get(herb.slug) || { score: 0, signals: new Set() }
      const collectionMatches = herbCollectionMatches.get(herb.slug) || 0
      const qualityScore = Number(manifestRow?.completenessScore || 0)
      const sourceCount = asList(herb.sources).length
      const compoundsCount = asList(herb.activeCompounds).length
      const searchIntentScore = clamp(asList(herb.effects).length, 0, 6)
      const indexableScore = indexableHerbRoutes.has(route) ? 12 : 0

      const score =
        indexableScore +
        qualityScore * 0.7 +
        homepageSignal.score +
        collectionMatches * 3 +
        clamp(sourceCount, 0, 4) +
        clamp(compoundsCount, 0, 4) +
        searchIntentScore

      return {
        slug: herb.slug,
        route,
        name: herb.common || herb.name || herb.slug,
        score: Number(score.toFixed(2)),
        why: {
          indexable: indexableHerbRoutes.has(route),
          publicationCompleteness: qualityScore,
          homepageProminenceSignals: [...homepageSignal.signals],
          matchingCollections: collectionMatches,
          sourceCount,
          activeCompoundCount: compoundsCount,
          searchIntentSignal: searchIntentScore,
        },
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  const topCompounds = compounds
    .filter(compound => compound.slug && compound.slug !== 'object-object')
    .map(compound => {
      const route = `/compounds/${compound.slug}`
      const manifestRow = indexableCompoundEntries.find(item => item.slug === compound.slug)
      const homepageSignal = homepageCompoundProminence.get(compound.slug) || {
        score: 0,
        signals: new Set(),
      }
      const collectionMatches = compoundCollectionMatches.get(compound.slug) || 0
      const linkedHerbs = asList(compound.herbs).length
      const sourceCount = asList(compound.sources).length
      const effectCount = asList(compound.effects).length
      const mechanismScore = String(compound.mechanism || '').trim().length > 25 ? 3 : 0
      const qualityScore = Number(manifestRow?.completenessScore || 0)
      const indexableScore = indexableCompoundRoutes.has(route) ? 12 : 0

      const score =
        indexableScore +
        qualityScore * 0.7 +
        homepageSignal.score +
        collectionMatches * 3.5 +
        clamp(linkedHerbs, 0, 10) * 1.5 +
        clamp(effectCount, 0, 8) * 0.7 +
        clamp(sourceCount, 0, 4) +
        mechanismScore

      return {
        slug: compound.slug,
        route,
        name: compound.name || compound.slug,
        score: Number(score.toFixed(2)),
        why: {
          indexable: indexableCompoundRoutes.has(route),
          publicationCompleteness: qualityScore,
          homepageProminenceSignals: [...homepageSignal.signals],
          matchingCollections: collectionMatches,
          linkedHerbCount: linkedHerbs,
          effectCount,
          sourceCount,
          hasMechanismNarrative: mechanismScore > 0,
        },
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  const topCollections = collections
    .map(collection => {
      const audit = approvedCollectionBySlug.get(collection.slug)
      const isFeatured = featuredSlugs.includes(collection.slug)
      const relatedCount = asList(collection.relatedSlugs).length
      const editorialScore = collection.editorial ? 4 : 0
      const introDepth = clamp(String(collection.intro || '').length / 45, 0, 4)
      const itemCount = Number(audit?.matchCount || 0)
      const indexableScore = audit?.approved ? 10 : 0

      const score =
        indexableScore +
        itemCount * 0.4 +
        relatedCount +
        editorialScore +
        introDepth +
        (isFeatured ? 6 : 0)

      return {
        slug: collection.slug,
        route: `/collections/${collection.slug}`,
        name: collection.title,
        score: Number(score.toFixed(2)),
        why: {
          indexable: Boolean(audit?.approved),
          matchCount: itemCount,
          itemType: collection.itemType,
          homepageFeaturedCollection: isFeatured,
          relatedCollections: relatedCount,
          hasEditorialBrief: Boolean(collection.editorial),
          qualityExclusionReasons: asList(audit?.reasons),
        },
      }
    })
    .filter(entry => entry.why.indexable)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  const collectionBySlug = new Map(collections.map(collection => [collection.slug, collection]))
  const indexableCollectionEditorialExamples = topCollections.map(entry => {
    const collection = collectionBySlug.get(entry.slug)
    if (!collection) return { slug: entry.slug, route: entry.route, title: entry.name, examples: [] }

    const examples =
      collection.itemType === 'herb'
        ? herbs
            .filter(herb => filterHerbByCollection(herb, collection.filters || {}))
            .slice(0, 3)
            .map(herb => herb.common || herb.name || herb.slug)
        : collection.itemType === 'compound'
          ? compounds
              .filter(compound => filterCompoundByCollection(compound, collection.filters || {}))
              .slice(0, 3)
              .map(compound => compound.name || compound.slug)
          : combos
              .filter(combo => filterComboByCollection(combo, collection.filters || {}))
              .slice(0, 3)
              .map(combo => combo.name || combo.id)

    return {
      slug: collection.slug,
      route: `/collections/${collection.slug}`,
      title: collection.title,
      itemType: collection.itemType,
      examples,
      keyTradeoffs: asList(collection?.editorial?.keyTradeoffs).slice(0, 2),
      exclusionsAndCautions: [
        ...asList(collection?.editorial?.exclusions),
        ...asList(collection?.editorial?.cautions),
      ].slice(0, 3),
      alternatives: asList(collection?.editorial?.alternatives).slice(0, 3),
      nextAction: String(collection?.editorial?.ctaLabel || ''),
    }
  })

  return {
    generatedAt: new Date().toISOString(),
    generatedOn: today,
    signalsUsed: [
      'homepage feature/curated prominence',
      'publication-manifest completeness + indexable route status',
      'collection match frequency (search-intent + internal-link utility proxy)',
      'entity depth signals (sources/effects/mechanism/linked entities)',
      'collection quality + homepage featured collection list',
    ],
    sourceSnapshots: {
      publicationManifestGeneratedAt: publicationManifest.generatedAt || null,
      homepageDataGeneratedAt: homepageData.generatedAt || null,
      routeManifest: {
        herbRoutes: metadata?.herbRoutes || 0,
        compoundRoutes: metadata?.compoundRoutes || 0,
        collectionRoutes: metadata?.collectionRoutes || 0,
      },
    },
    topHerbs,
    topCompounds,
    topCollections,
    indexableCollectionEditorialExamples,
  }
}

const report = buildReport()
const outPath = path.join(ROOT, 'public/data/seo-priority-report.json')
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

console.log(
  `[seo-priority-report] wrote ${outPath} herbs=${report.topHerbs.length} compounds=${report.topCompounds.length} collections=${report.topCollections.length}`
)
