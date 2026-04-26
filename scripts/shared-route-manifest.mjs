import fs from 'node:fs'
import path from 'node:path'
import { countBootstrapSources } from './source-normalization.mjs'

const ROOT = process.cwd()
const BLOG_PER_PAGE = 12
const DEFAULT_ENTITY_CAP = Number.parseInt(process.env.PRERENDER_ENTITY_CAP || '2000', 10)

const CORE_STATIC_ROUTES = [
  '/',
  '/about',
  '/blog',
  '/newsletter',
  '/privacy',
  '/disclaimer',
  '/methodology',
  '/contact',
  '/learning',
  '/herbs',
  '/compounds',
  '/downloads',
  '/contribute',
  '/interactions',
  '/compare',
  '/guides/unknown-compound-survival-guide',
  '/build',
]

const DISALLOWED_ROUTES = [
  '/analytics',
  '/data-fix',
  '/graph',
  '/theme',
  '/preview',
  '/drafts',
  '/tmp',
  '/temp',
  '/test',
  '/dev',
  '/data-report',
]

const CORE_ROUTE_META = new Map([
  ['/', { title: 'The Hippie Scientist', description: 'Science-first herbal education and evidence-aware reference pages.' }],
  ['/about', { title: 'About | The Hippie Scientist', description: 'Editorial standards, mission, and evidence posture.' }],
  ['/blog', { title: 'Research Notebook | The Hippie Scientist', description: 'Mechanism-focused herbal and compound research notes.' }],
  ['/newsletter', { title: 'Newsletter | The Hippie Scientist', description: 'Get research notes, safety-first updates, and new guides.' }],
  ['/privacy', { title: 'Privacy Policy | The Hippie Scientist', description: 'How The Hippie Scientist handles analytics and subscriber data.' }],
  ['/disclaimer', { title: 'Disclaimer | The Hippie Scientist', description: 'Educational-use disclaimer and risk boundaries.' }],
  ['/methodology', { title: 'Methodology | The Hippie Scientist', description: 'How evidence is selected, summarized, and scored for confidence.' }],
  ['/contact', { title: 'Contact | The Hippie Scientist', description: 'Contact the editorial team and submit corrections or sources.' }],
  ['/learning', { title: 'Learning Paths | The Hippie Scientist', description: 'Structured paths across herbs, compounds, and safety context.' }],
  ['/herbs', { title: 'Herb Database | The Hippie Scientist', description: 'Browse herb profiles, mechanisms, and safety notes.' }],
  ['/compounds', { title: 'Compound Database | The Hippie Scientist', description: 'Browse active compounds, pharmacology, and related herbs.' }],
  ['/downloads', { title: 'Downloads | The Hippie Scientist', description: 'Download practical guides, checklists, and educational resources.' }],
  ['/contribute', { title: 'Contribute | The Hippie Scientist', description: 'Submit feedback, corrections, and research sources to improve this project.' }],
  ['/interactions', { title: 'Interactions | The Hippie Scientist', description: 'Explore herb and compound interaction context with safety-first framing.' }],
  ['/compare', { title: 'Compare Herbs | The Hippie Scientist', description: 'Compare herb profiles side-by-side with evidence-aware context.' }],
  ['/guides/unknown-compound-survival-guide', { title: 'Unknown Compound Survival Guide | The Hippie Scientist', description: 'Harm-reduction and safety-first guidance for uncertain compounds.' }],
  ['/build', { title: 'Build Blend | The Hippie Scientist', description: 'Build and evaluate herb stacks with safety-first interaction context.' }],
])

const ENTRY_ROUTES = [
  {
    route: '/best-herbs-for-anxiety',
    title: 'Best Herbs for Anxiety (Natural Options That Actually Help) | The Hippie Scientist',
    description:
      'Discover the most effective herbs for anxiety, how they work, and which ones to try first.',
  },
  {
    route: '/best-herbs-for-sleep',
    title: 'Best Herbs for Sleep (Natural Nighttime Support) | The Hippie Scientist',
    description:
      'Compare practical herbs for sleep support, how they are commonly used, and which options to test first.',
  },
  {
    route: '/best-herbs-for-focus',
    title: 'Best Herbs for Focus (Natural Clarity and Concentration) | The Hippie Scientist',
    description:
      'Explore herbs for focus and mental clarity, including practical use cases and where to start safely.',
  },
  {
    route: '/best-herbs-for-stress',
    title: 'Best Herbs for Stress Relief (Calmer Daily Support) | The Hippie Scientist',
    description:
      'Find herbs commonly used for stress relief, how they may help, and which choices are easiest to begin with.',
  },
  {
    route: '/best-herbs-for-energy',
    title: 'Best Herbs for Natural Energy (Steady, Non-Jittery Options) | The Hippie Scientist',
    description:
      'Review herbs for natural energy and stamina, compare practical options, and pick a simple starting point.',
  },
]

const CORE_SITEMAP_META = new Map([
  ['/', { priority: 1.0, changefreq: 'weekly' }],
  ['/blog', { priority: 0.8, changefreq: 'daily' }],
  ['/herbs', { priority: 0.9, changefreq: 'weekly' }],
  ['/compounds', { priority: 0.9, changefreq: 'weekly' }],
  ['/downloads', { priority: 0.6, changefreq: 'monthly' }],
  ['/contribute', { priority: 0.5, changefreq: 'monthly' }],
  ['/interactions', { priority: 0.7, changefreq: 'weekly' }],
  ['/compare', { priority: 0.6, changefreq: 'weekly' }],
  ['/guides/unknown-compound-survival-guide', { priority: 0.6, changefreq: 'monthly' }],
  ['/build', { priority: 0.8, changefreq: 'weekly' }],
])

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizePath = route => {
  if (!route || route === '/') return '/'
  return `/${String(route).replace(/^\/+|\/+$/g, '')}`
}

const dedupe = routes => [...new Set(routes.map(normalizePath))]
const clip = (value, max = 155) => String(value || '').trim().slice(0, max)
const NAN_TOKEN_PATTERN = /(^|[\s;,.()-])nan([\s;,.()-]|$)/i
const GOVERNED_MODEL_VERSION = 'seo-enrichment-refresh-v1'
const WEAK_OR_UNCERTAIN_EVIDENCE = new Set([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
  'mixed_or_uncertain',
  'conflicting_evidence',
])
const BLOCKED_ENRICHMENT_LABELS = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'partial',
])

function safeStr(value) {
  if (!value || typeof value === 'number' || value !== value) return ''
  const normalized = String(value).trim()
  if (!normalized || NAN_TOKEN_PATTERN.test(normalized)) return ''
  return normalized
}

function normalizeEntityLabel(value) {
  const text = safeStr(value)
  if (!text) return ''
  return text
    .replace(/\(\s*\)/g, ' ')
    .replace(/\)+$/g, '')
    .replace(/\(+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildRouteFallbackDescription(entry, fallbackKind, fallbackName) {
  const explicit = clip(safeStr(entry?.description))
  if (explicit && !/reference profile|compound profile|herb profile/i.test(explicit)) {
    return explicit
  }
  const summary = clip(safeStr(entry?.summary || entry?.hero || ''))
  if (summary) return summary
  if (fallbackKind === 'compound') {
    return clip(`${fallbackName} is tracked as a reported constituent in the workbook. This profile is pending deeper mechanism and safety review.`)
  }
  return clip(`${fallbackName} profile with evidence-aware summary, mechanism context, and safety notes when available.`)
}

function normalizeEvidenceLabelTitle(label) {
  return String(label || 'insufficient_evidence')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function buildGovernedSeoMeta({ name, kind, fallbackTitle, fallbackDescription, summary, noindex }) {
  if (noindex || !summary || summary.enrichedAndReviewed !== true) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      changed: false,
      reasons: noindex ? ['noindex-route'] : ['missing-governed-summary'],
      usedSignals: [],
      excludedSignals: [],
    }
  }

  const evidenceLabel = safeStr(summary.evidenceLabel || 'insufficient_evidence')
  const evidenceLabelTitle = safeStr(summary.evidenceLabelTitle) || normalizeEvidenceLabelTitle(evidenceLabel)
  const weakOrUncertain = WEAK_OR_UNCERTAIN_EVIDENCE.has(evidenceLabel)

  const usedSignals = [`evidence_label:${evidenceLabel}`, 'enriched_reviewed:true']
  const excludedSignals = []

  const descriptionParts = [`Governed review: ${evidenceLabelTitle.toLowerCase()}.`]
  if (summary.supportedUseCoveragePresent && !weakOrUncertain) {
    descriptionParts.push('Includes scoped supported-use context from approved sources.')
    usedSignals.push('supported_use:included')
  } else if (summary.supportedUseCoveragePresent && weakOrUncertain) {
    excludedSignals.push('supported_use:excluded_weak_or_uncertain_evidence')
  }

  if (summary.safetyCautionsPresent) {
    descriptionParts.push('Safety and interaction cautions are included.')
    usedSignals.push('safety_interactions:present')
  } else {
    excludedSignals.push('safety_interactions:absent')
  }

  if (summary.mechanismOrConstituentCoveragePresent) {
    descriptionParts.push('Mechanism and constituent coverage is available.')
    usedSignals.push('mechanism_constituent:present')
  } else {
    excludedSignals.push('mechanism_constituent:absent')
  }

  if (summary.conflictingEvidence) {
    descriptionParts.push('Evidence includes unresolved conflicts; avoid overconfident conclusions.')
    usedSignals.push('conflict_uncertainty:present')
  } else if (weakOrUncertain) {
    descriptionParts.push(
      'Evidence remains limited and should not be interpreted as strong human proof.',
    )
    usedSignals.push('weak_evidence_guardrail:applied')
  }

  const reviewedDate = normalizeDate(summary.lastReviewedAt)
  if (reviewedDate) {
    descriptionParts.push(`Last reviewed ${reviewedDate}.`)
    usedSignals.push('last_reviewed:included')
  }

  descriptionParts.push('Educational reference only.')
  const governedDescription = clip(descriptionParts.join(' '), 155)

  let governedTitle = fallbackTitle
  if (!weakOrUncertain && summary.hasHumanEvidence) {
    governedTitle = `${name} ${kind} Guide | ${evidenceLabelTitle}`
    usedSignals.push('title_enrichment:enabled')
  } else {
    excludedSignals.push('title_enrichment:excluded_weak_or_nonhuman')
  }

  return {
    title: governedTitle,
    description: governedDescription || fallbackDescription,
    changed: governedTitle !== fallbackTitle || governedDescription !== fallbackDescription,
    reasons: [],
    usedSignals,
    excludedSignals,
  }
}

const readJson = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function pickDataFile(primaryPath, fallbackPath) {
  const primary = readJson(primaryPath)
  if (primary.length > 0) return primary
  return readJson(fallbackPath)
}

function pickFirstDataFile(paths) {
  for (const relativePath of paths) {
    const records = readJson(relativePath)
    if (records.length > 0) return records
  }
  return []
}

function readDetailDataFiles(dir) {
  const fullDir = path.join(ROOT, 'public', 'data', dir)
  if (!fs.existsSync(fullDir)) return []
  const files = fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => path.join(fullDir, entry.name))
  const records = []
  for (const filePath of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        records.push(parsed)
      }
    } catch {
      // ignore malformed detail files
    }
  }
  return records
}

const readText = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : ''
}

const normalizeDate = value => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function scoreEntity(record) {
  const sources = countBootstrapSources([record?.sources, record?.source, record?.references, record?.citations])
  const effects = Array.isArray(record?.effects) ? record.effects.length : 0
  const hasMechanism = String(record?.mechanism || '').trim().length > 0 ? 1 : 0
  const hasDescription = String(record?.description || record?.summary || '').trim().length > 0 ? 1 : 0
  const hasContraindications = Array.isArray(record?.contraindications)
    ? record.contraindications.length > 0
      ? 1
      : 0
    : 0

  return sources * 3 + effects + hasMechanism * 2 + hasDescription * 2 + hasContraindications
}

function pickTopEntities(records, basePath, explicitAllowlist, cap, label) {
  const fallbackLastmod = new Date().toISOString().slice(0, 10)
  const byScore = records
    .map(record => {
      const slug = slugify(
        record?.slug ||
          record?.commonName ||
          record?.common ||
          record?.name ||
          record?.latinName ||
          record?.latin ||
          record?.id
      )
      if (!slug) return null
      const displayName =
        safeStr(record?.commonName) ||
        safeStr(record?.common) ||
        safeStr(record?.name) ||
        safeStr(record?.latinName) ||
        safeStr(record?.latin) ||
        slug
      const inferredCompoundSummary = [
        safeStr(record?.mechanism),
        ...(Array.isArray(record?.mechanisms) ? record.mechanisms.map(safeStr) : []),
      ]
        .filter(Boolean)
        .slice(0, 2)
        .join('. ')
      const inferredSummary = safeStr(record?.summary) || safeStr(record?.description) || inferredCompoundSummary
      const description = clip(inferredSummary || `${displayName} profile.`)
      const resolvedDate =
        normalizeDate(record?.updated_at) || normalizeDate(record?.lastmod) || normalizeDate(record?.date) || fallbackLastmod
      return {
        route: `${basePath}/${slug}`,
        score: scoreEntity(record),
        title: `${displayName} | The Hippie Scientist`,
        description,
        kind: label,
        lastmod: resolvedDate,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  const byRoute = new Map(byScore.map(item => [item.route, item]))
  const selected = []
  const seen = new Set()

  for (const route of explicitAllowlist) {
    const item = byRoute.get(route)
    if (!item || seen.has(route) || !route.startsWith(basePath)) continue
    selected.push(item)
    seen.add(route)
  }

  for (const candidate of byScore) {
    if (selected.length >= cap) break
    if (seen.has(candidate.route)) continue
    selected.push(candidate)
    seen.add(candidate.route)
  }

  return selected
}

function extractLearningRouteAllowlist() {
  const file = readText('src/data/learning-paths.ts')
  if (!file) return []
  const matches = file.match(/href:\s*'([^']+)'/g) || []
  return dedupe(
    matches
      .map(match => match.match(/href:\s*'([^']+)'/)?.[1] || '')
      .filter(route => route.startsWith('/herbs/') || route.startsWith('/compounds/'))
  )
}

function extractGoalRoutes() {
  const file = readText('src/data/goals.ts')
  if (!file) return []
  const matches = [...file.matchAll(/id:\s*'([^']+)'/g)]
  return dedupe(matches.map(match => `/herbs-for-${match[1]}`))
}

function parseSeoCollections() {
  const file = readText('src/data/seoCollections.ts')
  if (!file) return []

  const match = file.match(/export const SEO_COLLECTIONS:\s*SeoCollection\[\]\s*=\s*(\[[\s\S]*?\n\])/)
  if (!match?.[1]) return []

  try {
    const parsed = Function(`"use strict"; return (${match[1]});`)()
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toSearchBlob(fields) {
  return fields
    .flatMap(field => {
      if (Array.isArray(field)) return field
      if (typeof field === 'string') return field.split(/[\n,;|]+/)
      return []
    })
    .map(token => String(token || '').trim().toLowerCase())
    .filter(Boolean)
    .join(' ')
}

function matchesAny(blob, terms = []) {
  if (!Array.isArray(terms) || terms.length === 0) return true
  return terms.some(term => blob.includes(String(term || '').toLowerCase()))
}

function hasStableSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''))
}

function filterHerbByCollection(herb, filters = {}) {
  const effectBlob = toSearchBlob([herb?.effects, herb?.description])
  const mechanismBlob = toSearchBlob([herb?.mechanism, herb?.mechanismOfAction])
  const interactionBlob = toSearchBlob([herb?.interactionTags, herb?.interactions, herb?.tags])

  return (
    matchesAny(effectBlob, filters.effectsAny) &&
    matchesAny(mechanismBlob, filters.mechanismAny) &&
    matchesAny(interactionBlob, filters.interactionTagsAny)
  )
}

function filterCompoundByCollection(compound, filters = {}) {
  const effectBlob = toSearchBlob([compound?.effects, compound?.description])
  const mechanismBlob = toSearchBlob([compound?.mechanism])
  const interactionBlob = toSearchBlob([
    compound?.interactionTags,
    compound?.interactions,
    compound?.category,
  ])

  return (
    matchesAny(effectBlob, filters.effectsAny) &&
    matchesAny(mechanismBlob, filters.mechanismAny) &&
    matchesAny(interactionBlob, filters.interactionTagsAny)
  )
}

function filterComboByCollection(combo, filters = {}) {
  const goals = Array.isArray(filters.comboGoalsAny) ? filters.comboGoalsAny : []
  const goalMatch = goals.length === 0 || goals.includes(combo?.goal)
  const nameBlob = String(combo?.name || '').toLowerCase()
  const descriptionBlob = String(combo?.description || '').toLowerCase()
  const nameMatch = matchesAny(nameBlob, filters.comboNameAny)
  const descriptionMatch = matchesAny(descriptionBlob, filters.comboDescriptionAny)
  return goalMatch && (nameMatch || descriptionMatch)
}

function auditCollectionRoutes({ herbs, compounds, combos }) {
  const COLLECTION_QUALITY = {
    introMinLength: 40,
    descriptionMinLength: 40,
    whoForMinLength: 70,
    selectionRationaleMinLength: 90,
    minCautions: 1,
    minAlternatives: 2,
    ctaLabelMinLength: 24,
    minItemsByType: {
      herb: 6,
      compound: 6,
      combo: 3,
    },
  }

  const collections = parseSeoCollections()
  const slugCounts = new Map()
  collections.forEach(collection => {
    const slug = String(collection?.slug || '')
    slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1)
  })

  const audits = collections.map(collection => {
    const slug = String(collection?.slug || '')
    const route = `/collections/${slug}`
    const intro = String(collection?.intro || '').trim()
    const description = String(collection?.description || '').trim()
    const editorial = collection?.editorial || null
    const filters = collection?.filters || {}
    const itemType = collection?.itemType || 'herb'

    const matchCount =
      itemType === 'herb'
        ? herbs.filter(entry => filterHerbByCollection(entry, filters)).length
        : itemType === 'compound'
          ? compounds.filter(entry => filterCompoundByCollection(entry, filters)).length
          : combos.filter(entry => filterComboByCollection(entry, filters)).length

    const reasons = []

    if (!hasStableSlug(slug)) reasons.push('unstable-slug')
    if ((slugCounts.get(slug) || 0) !== 1) reasons.push('duplicate-slug')
    if (intro.length < COLLECTION_QUALITY.introMinLength) reasons.push('missing-intro')
    if (description.length < COLLECTION_QUALITY.descriptionMinLength) reasons.push('missing-description')
    if (!editorial) {
      reasons.push('missing-editorial-brief')
    } else {
      if (String(editorial?.whoFor || '').trim().length < COLLECTION_QUALITY.whoForMinLength) {
        reasons.push('missing-who-for')
      }
      if (
        String(editorial?.selectionRationale || '').trim().length <
        COLLECTION_QUALITY.selectionRationaleMinLength
      ) {
        reasons.push('missing-selection-rationale')
      }
      const cautionCount = Array.isArray(editorial?.cautions)
        ? editorial.cautions.filter(note => String(note || '').trim().length > 0).length
        : 0
      if (cautionCount < COLLECTION_QUALITY.minCautions) reasons.push('missing-caution')

      const alternativeCount = Array.isArray(editorial?.alternatives)
        ? editorial.alternatives.filter(item => String(item || '').trim().length > 0).length
        : 0
      if (alternativeCount < COLLECTION_QUALITY.minAlternatives) reasons.push('missing-alternatives')

      if (String(editorial?.ctaLabel || '').trim().length < COLLECTION_QUALITY.ctaLabelMinLength) {
        reasons.push('missing-cta-guidance')
      }
    }

    const minItems = COLLECTION_QUALITY.minItemsByType[itemType] || 6
    if (matchCount < minItems) reasons.push('insufficient-matching-items')

    return {
      slug,
      route,
      itemType,
      matchCount,
      minRequired: minItems,
      hasStableSlug: hasStableSlug(slug),
      introLength: intro.length,
      descriptionLength: description.length,
      approved: reasons.length === 0,
      reasons,
    }
  })

  const approved = audits.filter(audit => audit.approved)

  return {
    routes: approved.map(audit => audit.route),
    audits,
    thresholds: COLLECTION_QUALITY,
  }
}

function getBlogEntries() {
  const posts = readJson('src/data/blog/posts.json')
  return dedupe(
    posts
      .filter(post => post?.draft !== true)
      .map(post => {
        const slug = String(post?.slug || '').replace(/^\/+|\/+$/g, '')
        return slug ? `/blog/${slug}` : ''
      })
      .filter(Boolean)
  ).map(route => {
    const slug = route.split('/').pop()
    const post = posts.find(item => item?.slug === slug)
    return {
      route,
      title: `${post?.title || 'Blog Post'} | The Hippie Scientist`,
      description: clip(post?.summary || post?.description || 'Research notebook entry.'),
      lastmod: normalizeDate(post?.date),
    }
  })
}

function getGovernedSummaryMap(filePath) {
  const rows = readJson(filePath)
  const map = new Map()
  for (const row of rows) {
    const slug = safeStr(row?.slug)
    if (!slug) continue
    const summary = row?.researchEnrichmentSummary
    if (!summary || typeof summary !== 'object') continue
    map.set(slug, summary)
  }
  return map
}

export function getSharedRouteManifest() {
  const routeMeta = new Map()
  const sitemapMeta = new Map()
  const routeDirectives = new Map()
  const putRouteMeta = (route, title, description) => routeMeta.set(route, { title, description })
  const putSitemapMeta = (route, meta = {}) => sitemapMeta.set(route, meta)
  const putRouteDirectives = (route, directives = {}) => routeDirectives.set(route, directives)
  const herbSummaryRows = readJson('public/data/herbs-summary.json')
  const compoundSummaryRows = readJson('public/data/compounds-summary.json')
  const herbGovernedSummaryBySlug = getGovernedSummaryMap('public/data/herbs-summary.json')
  const compoundGovernedSummaryBySlug = getGovernedSummaryMap('public/data/compounds-summary.json')
  const seoRefreshRows = []

  CORE_STATIC_ROUTES.forEach(route => {
    const meta = CORE_ROUTE_META.get(route)
    if (meta) putRouteMeta(route, meta.title, meta.description)
    putSitemapMeta(route, {
      priority: CORE_SITEMAP_META.get(route)?.priority ?? 0.8,
      changefreq: CORE_SITEMAP_META.get(route)?.changefreq ?? 'weekly',
    })
  })
  putRouteDirectives('/build', {
    noindex: true,
    reason: 'utility-route',
  })
  ;['/downloads', '/contribute', '/interactions', '/compare', '/guides/unknown-compound-survival-guide'].forEach(
    route => {
      putRouteDirectives(route, {
        noindex: true,
        reason: 'thin-static-utility-route',
      })
    },
  )

  const goalRoutes = extractGoalRoutes()
  goalRoutes.forEach(route => {
    const goalLabel = route
      .replace('/herbs-for-', '')
      .split('-')
      .map(token => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ')
    putRouteMeta(
      route,
      `${goalLabel} Herb Guide | The Hippie Scientist`,
      'Explore herbs aligned to a specific effect goal with safety context.'
    )
    putSitemapMeta(route, { priority: 0.7, changefreq: 'weekly' })
  })

  ENTRY_ROUTES.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.7, changefreq: 'weekly' })
  })

  const collectionQuality = auditCollectionRoutes({
    herbs: readJson('public/data/herbs.json'),
    compounds: readJson('public/data/compounds.json'),
    combos: readJson('public/data/prebuiltCombos.json'),
  })
  const collections = parseSeoCollections()
  const collectionBySlug = new Map(
    collections.map(collection => [safeStr(collection?.slug), collection]),
  )
  const collectionRoutes = collectionQuality.routes
  collectionRoutes.forEach(route => {
    const slug = safeStr(route.split('/').pop())
    const collection = collectionBySlug.get(slug)
    const baseTitle = collection?.title
      ? `${collection.title} Collection Guide`
      : 'Collection Guide | The Hippie Scientist'
    const baseDescription = clip(
      safeStr(collection?.description) || 'Topic-focused collections for herb and compound exploration.',
    )
    const itemType = safeStr(collection?.itemType || 'herb')
    const matches =
      itemType === 'herb'
        ? herbSummaryRows.filter(entry => filterHerbByCollection(entry, collection?.filters || {}))
        : itemType === 'compound'
          ? compoundSummaryRows.filter(entry =>
              filterCompoundByCollection(entry, collection?.filters || {}),
            )
          : []
    const governedMatches = matches.filter(
      entry => entry?.researchEnrichmentSummary?.enrichedAndReviewed === true,
    )
    const strongGovernedMatches = governedMatches.filter(entry => {
      const label = safeStr(entry?.researchEnrichmentSummary?.evidenceLabel)
      return label === 'stronger_human_support' || label === 'limited_human_support'
    })
    const finalDescription =
      strongGovernedMatches.length > 0
        ? clip(
            `${baseDescription} Includes ${strongGovernedMatches.length} governed profiles with human-support labels and safety-aware comparison context.`,
          )
        : baseDescription
    putRouteMeta(route, baseTitle, finalDescription)
    seoRefreshRows.push({
      route,
      pageType: 'collection_page',
      entitySlug: slug,
      changed: finalDescription !== baseDescription,
      usedSignals:
        strongGovernedMatches.length > 0
          ? [
              'governed_collection_coverage:enabled',
              `governed_stronger_or_limited:${strongGovernedMatches.length}`,
            ]
          : [],
      excludedSignals:
        strongGovernedMatches.length === 0
          ? ['governed_collection_coverage:excluded_insufficient_human_signal']
          : [],
      unchangedReason:
        strongGovernedMatches.length === 0 ? 'insufficient-strong-governed-coverage' : null,
    })
    putSitemapMeta(route, { priority: 0.7, changefreq: 'weekly' })
  })

  const blogEntries = getBlogEntries()
  blogEntries.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.6, changefreq: 'weekly', lastmod: entry.lastmod })
  })

  const blogPages = Math.ceil(blogEntries.length / BLOG_PER_PAGE)
  const paginatedBlogRoutes =
    blogPages > 1 ? Array.from({ length: blogPages - 1 }, (_, index) => `/blog/page/${index + 2}`) : []
  paginatedBlogRoutes.forEach((route, index) => {
    putRouteMeta(route, `Research Notebook — Page ${index + 2} | The Hippie Scientist`, 'Paginated archive of research posts and field notes.')
    putSitemapMeta(route, { priority: 0.6, changefreq: 'weekly' })
    putRouteDirectives(route, {
      noindex: true,
      reason: 'paginated-archive',
    })
  })

  const learningAllowlist = extractLearningRouteAllowlist()
  const herbSeedRecords = pickFirstDataFile(['public/data/herbs.json', 'public/data/herbs-summary.json'])
  const herbRecords = herbSeedRecords.length > 0 ? herbSeedRecords : readDetailDataFiles('herbs-detail')
  const compoundSeedRecords = pickFirstDataFile([
    'public/data/compounds.json',
    'public/data/compounds-summary.json',
  ])
  const compoundRecords =
    compoundSeedRecords.length > 0 ? compoundSeedRecords : readDetailDataFiles('compounds-detail')
  const prioritizeAllowlist = (entries, allowlist) => {
    const byRoute = new Map(entries.map(entry => [entry.route, entry]))
    const prioritized = []
    const seen = new Set()

    for (const route of allowlist) {
      const normalized = normalizePath(route)
      const entry = byRoute.get(normalized)
      if (!entry || seen.has(normalized)) continue
      prioritized.push(entry)
      seen.add(normalized)
    }

    for (const entry of entries) {
      if (seen.has(entry.route)) continue
      prioritized.push(entry)
      seen.add(entry.route)
    }

    return prioritized
  }

  const toRouteEntry = (entry, fallbackKind) => {
    const route = normalizePath(entry?.route || `/${fallbackKind}s/${entry?.slug || ''}`)
    if (!route.startsWith(`/${fallbackKind}s/`)) return null
    const slug = safeStr(route.split('/').pop())
    const fallbackName = normalizeEntityLabel(entry?.name) || route.split('/').pop()
    const fallbackTitle = safeStr(entry?.title) || `${fallbackName} | The Hippie Scientist`
    const fallbackDescription = buildRouteFallbackDescription(entry, fallbackKind, fallbackName)
    const summary =
      fallbackKind === 'herb'
        ? herbGovernedSummaryBySlug.get(slug)
        : compoundGovernedSummaryBySlug.get(slug)
    const governedSeo = buildGovernedSeoMeta({
      name: fallbackName || slug,
      kind: fallbackKind === 'herb' ? 'Herb' : 'Compound',
      fallbackTitle,
      fallbackDescription,
      summary,
      noindex: false,
    })
    seoRefreshRows.push({
      route,
      pageType: `${fallbackKind}_detail`,
      entitySlug: slug,
      changed: governedSeo.changed,
      usedSignals: governedSeo.usedSignals,
      excludedSignals: governedSeo.excludedSignals,
      unchangedReason: governedSeo.changed ? null : governedSeo.reasons[0] || 'no-change',
    })
    return {
      route,
      score: Number(entry?.score || 0),
      title: governedSeo.title,
      description: governedSeo.description,
      kind: fallbackKind,
      lastmod: normalizeDate(entry?.lastmod) || new Date().toISOString().slice(0, 10),
    }
  }

  const herbEntries = prioritizeAllowlist(
    pickTopEntities(herbRecords, '/herbs', [], DEFAULT_ENTITY_CAP, 'herb')
      .map(entry => toRouteEntry(entry, 'herb'))
      .filter(Boolean),
    learningAllowlist
  ).slice(0, DEFAULT_ENTITY_CAP)
  const compoundEntries = prioritizeAllowlist(
    pickTopEntities(compoundRecords, '/compounds', [], DEFAULT_ENTITY_CAP, 'compound')
      .map(entry => toRouteEntry(entry, 'compound'))
      .filter(Boolean),
    learningAllowlist
  ).slice(0, DEFAULT_ENTITY_CAP)

  herbEntries.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.7, changefreq: 'monthly', lastmod: entry.lastmod })
  })
  compoundEntries.forEach(entry => {
    putRouteMeta(entry.route, entry.title, entry.description)
    putSitemapMeta(entry.route, { priority: 0.7, changefreq: 'monthly', lastmod: entry.lastmod })
  })

  const approvedRoutes = dedupe([
    ...CORE_STATIC_ROUTES,
    ...goalRoutes,
    ...ENTRY_ROUTES.map(entry => entry.route),
    ...collectionRoutes,
    ...paginatedBlogRoutes,
    ...blogEntries.map(entry => entry.route),
    ...herbEntries.map(entry => entry.route),
    ...compoundEntries.map(entry => entry.route),
  ])
    .filter(route => !DISALLOWED_ROUTES.includes(route))

  const prerenderRoutes = approvedRoutes
  const sitemapRoutes = approvedRoutes.filter(route => {
    return routeDirectives.get(route)?.noindex !== true
  })

  return {
    approvedRoutes,
    prerenderRoutes,
    sitemapRoutes,
    routeMeta,
    routeDirectives,
    sitemapMeta,
    disallowedRoutes: [...DISALLOWED_ROUTES],
    metadata: {
      entityCap: DEFAULT_ENTITY_CAP,
      blogPosts: blogEntries.length,
      paginatedBlogRoutes: paginatedBlogRoutes.length,
      coreRoutes: CORE_STATIC_ROUTES.length,
      goalRoutes: goalRoutes.length,
      collectionRoutes: collectionRoutes.length,
      collectionRoutesBeforeQuality: collectionQuality.audits.length,
      herbRoutes: herbEntries.length,
      compoundRoutes: compoundEntries.length,
      herbAllowlist: herbEntries.map(entry => entry.route).filter(route => learningAllowlist.includes(route)),
      compoundAllowlist: compoundEntries
        .map(entry => entry.route)
        .filter(route => learningAllowlist.includes(route)),
      herbCandidatesBeforeQuality: herbRecords.length,
      compoundCandidatesBeforeQuality: compoundRecords.length,
      herbRoutesAfterQuality: herbEntries.length,
      compoundRoutesAfterQuality: compoundEntries.length,
      qualityThresholds: null,
      publicationManifestGeneratedAt: null,
      qualityExclusions: {
        herbs: {},
        compounds: {},
        collections: collectionQuality.audits
          .filter(audit => !audit.approved)
          .reduce((acc, audit) => {
            audit.reasons.forEach(reason => {
              acc[reason] = (acc[reason] || 0) + 1
            })
            return acc
          }, {}),
      },
      seoEnrichmentRefresh: {
        modelVersion: GOVERNED_MODEL_VERSION,
        totalEvaluated: seoRefreshRows.length,
        changedCount: seoRefreshRows.filter(row => row.changed).length,
        unchangedCount: seoRefreshRows.filter(row => !row.changed).length,
        changedByPageType: seoRefreshRows
          .filter(row => row.changed)
          .reduce((acc, row) => {
            acc[row.pageType] = (acc[row.pageType] || 0) + 1
            return acc
          }, {}),
        unchangedReasons: seoRefreshRows
          .filter(row => !row.changed)
          .reduce((acc, row) => {
            const reason = row.unchangedReason || 'unknown'
            acc[reason] = (acc[reason] || 0) + 1
            return acc
          }, {}),
        blockedSignalPolicy: [...BLOCKED_ENRICHMENT_LABELS],
        rows: seoRefreshRows,
      },
      indexableCollections: collectionQuality.audits.filter(audit => audit.approved),
      excludedCollections: collectionQuality.audits.filter(audit => !audit.approved),
      collectionQualityThresholds: collectionQuality.thresholds,
    },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { approvedRoutes, metadata } = getSharedRouteManifest()
  console.log(JSON.stringify({ approvedRoutes, metadata }, null, 2))
}
