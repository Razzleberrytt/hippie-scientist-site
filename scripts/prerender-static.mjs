#!/usr/bin/env node
// Prerender now keeps SEO content in an sr-only container while leaving #root empty for visible React hydration.
import fs from 'node:fs'
import path from 'node:path'
import { getPrerenderPlan } from './prerender-routes.mjs'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const SITE_URL = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')
const SITE_NAME = 'The Hippie Scientist'

const { routes, routeMeta, routeDirectives, metadata } = getPrerenderPlan()

const baseTemplatePath = path.join(DIST, 'index.html')
if (!fs.existsSync(baseTemplatePath)) {
  console.error('[prerender-static] dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const indexTemplate = fs.readFileSync(baseTemplatePath, 'utf8')

const ensureDir = dir => fs.mkdirSync(dir, { recursive: true })
const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const normalize = route => (route === '/' ? '/' : `/${route.replace(/^\/+|\/+$/g, '')}`)
const canonicalUrl = route => `${SITE_URL}${route === '/' ? '/' : route}`
const NAN_TOKEN_PATTERN = /(^|[\s;,.()-])nan([\s;,.()-]|$)/i
const HEAD_REPLACE_PATTERNS = [
  /<title>[\s\S]*?<\/title>\s*/gi,
  /<link[^>]+rel=["']canonical["'][^>]*>\s*/gi,
  /<meta[^>]+name=["']description["'][^>]*>\s*/gi,
  /<meta[^>]+name=["']robots["'][^>]*>\s*/gi,
  /<meta[^>]+property=["']og:[^"']+["'][^>]*>\s*/gi,
  /<meta[^>]+name=["']twitter:[^"']+["'][^>]*>\s*/gi,
]

function readJson(relativePath) {
  const file = path.join(ROOT, relativePath)
  if (!fs.existsSync(file)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function pickDataFile(primary, fallback) {
  const primaryData = readJson(primary)
  if (primaryData.length > 0) return primaryData
  return readJson(fallback)
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
      // ignore unreadable detail records
    }
  }
  return records
}

function readDetailJson(dir, slug) {
  const file = path.join(ROOT, 'public', 'data', dir, `${slug}.json`)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

const blogPosts = readJson('src/data/blog/posts.json')
const herbs = pickFirstDataFile([
  'public/data/herbs.json',
  'public/data/herbs-summary.json',
])
const herbRecords = herbs.length > 0 ? herbs : readDetailDataFiles('herbs-detail')
const compounds = pickFirstDataFile([
  'public/data/compounds.json',
  'public/data/compounds-summary.json',
])
const compoundRecords = compounds.length > 0 ? compounds : readDetailDataFiles('compounds-detail')

const blogBySlug = new Map(blogPosts.map(post => [String(post?.slug || ''), post]))
const herbBySlug = new Map(
  herbRecords.map(record => {
    const slug = String(record?.slug || '').trim()
    return [slug, record]
  })
)
const compoundBySlug = new Map(
  compoundRecords.map(record => {
    const slug = String(record?.slug || '').trim()
    return [slug, record]
  })
)

const herbCardsFromManifest = herbRecords
  .map(item => {
    const slug = String(item?.slug || '').trim()
    if (!slug) return null
    return { slug, herb: item }
  })
  .filter(Boolean)
  .slice(0, 20)

const compoundCardsFromManifest = compoundRecords
  .map(item => {
    const slug = String(item?.slug || '').trim()
    if (!slug) return null
    return { slug, compound: item }
  })
  .filter(Boolean)
  .slice(0, 20)

function textList(value, limit = 5) {
  const list = Array.isArray(value) ? value : []
  return list
    .map(item => safeStr(item))
    .filter(Boolean)
    .slice(0, limit)
}

function trimToChars(value, limit = 500) {
  const normalized = safeStr(value)
  if (!normalized) return ''
  if (normalized.length <= limit) return normalized
  return `${normalized.slice(0, limit).trimEnd()}…`
}

function textFrom(...values) {
  for (const value of values) {
    const next = safeStr(value)
    if (next) return next
  }
  return ''
}

function safeStr(value) {
  if (!value || typeof value === 'number' || value !== value) return ''
  const normalized = String(value).trim()
  if (!normalized || NAN_TOKEN_PATTERN.test(normalized)) return ''
  return normalized
}

function inferCompoundDescription(compound, fallbackName) {
  const base = textFrom(compound?.description, compound?.summary)
  if (base) return base

  const mechanism = textFrom(compound?.mechanism, Array.isArray(compound?.mechanisms) ? compound.mechanisms.join('; ') : '')
  if (mechanism) return mechanism

  const pathways = Array.isArray(compound?.pathways) ? compound.pathways.map(safeStr).filter(Boolean).slice(0, 2) : []
  const targets = Array.isArray(compound?.targets) ? compound.targets.map(safeStr).filter(Boolean).slice(0, 2) : []
  const signalParts = [...pathways, ...targets]
  if (signalParts.length > 0) return signalParts.join('; ')

  return `${fallbackName} profile.`
}

function blogPostJsonLd(post, route, title, description) {
  const published = post?.date ? new Date(post.date).toISOString() : undefined
  const modified = post?.lastUpdated ? new Date(post.lastUpdated).toISOString() : published
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: canonicalUrl(route),
    url: canonicalUrl(route),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

function parseSeoCollections() {
  const file = path.join(ROOT, 'src', 'data', 'seoCollections.ts')
  if (!fs.existsSync(file)) return []
  const source = fs.readFileSync(file, 'utf8')
  const match = source.match(/export const SEO_COLLECTIONS:\s*SeoCollection\[\]\s*=\s*(\[[\s\S]*?\n\])/)
  if (!match?.[1]) return []
  try {
    const parsed = Function(`"use strict"; return (${match[1]});`)()
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const seoCollections = parseSeoCollections()
const collectionBySlug = new Map(
  seoCollections.map(collection => [String(collection?.slug || '').trim(), collection])
)

function resolveOgImage(route) {
  if (route.startsWith('/blog/')) {
    const slug = route.split('/').pop() || ''
    return `/og/blog/${slug}.png`
  }
  if (route.startsWith('/herbs/')) {
    const slug = route.split('/').pop() || ''
    return `/og/herb/${slug}.png`
  }
  return '/og/default.png'
}

function buildHead(route) {
  const meta = routeMeta.get(route) || {}
  const directives = routeDirectives.get(route) || {}
  const title = escapeHtml(safeStr(meta.title) || SITE_NAME)
  const description = escapeHtml(
    safeStr(meta.description) || 'Evidence-aware herbal education and safety context.'
  )
  const canonical = canonicalUrl(route)
  const image = canonicalUrl(resolveOgImage(route))
  const ogType = route.startsWith('/blog/') ? 'article' : 'website'

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    directives.noindex ? '<meta name="robots" content="noindex,nofollow" />' : '',
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].filter(Boolean)

  if (route === '/') {
    tags.push(
      `<script type="application/ld+json">${escapeHtml(JSON.stringify(websiteJsonLd()))}</script>`
    )
  }

  if (route.startsWith('/blog/')) {
    const slug = route.split('/').pop()
    const post = blogBySlug.get(slug || '')
    if (post) {
      tags.push(
        `<script type="application/ld+json">${escapeHtml(
          JSON.stringify(blogPostJsonLd(post, route, meta.title || '', meta.description || ''))
        )}</script>`
      )
    }
  }

  return tags.join('\n    ')
}

function makeCardList(items, fallbackText = 'Content is being updated.') {
  if (!items.length) return `<p>${escapeHtml(fallbackText)}</p>`
  return `<ul>${items
    .map(item => item)
    .join('')}</ul>`
}

function renderRouteContent(route) {
  const heading = escapeHtml(routeMeta.get(route)?.title || SITE_NAME)
  const routeDescription = escapeHtml(routeMeta.get(route)?.description || '')
  const staticContentByRoute = {
    '/about':
      'The Hippie Scientist publishes evidence-aware herbal explainers focused on mechanisms, practical risk boundaries, and transparent sourcing.',
    '/newsletter':
      'Subscribe for new research digests, route-quality updates, and editorial notes about changes in herb and compound publication standards.',
    '/privacy':
      'This page summarizes analytics use, newsletter data handling, and choices users have to control stored preferences and tracking behavior.',
    '/disclaimer':
      'Content is educational and not medical advice. Always evaluate interactions, contraindications, and local regulation before use decisions.',
    '/methodology':
      'Methodology outlines source requirements, confidence signals, and the quality filters used before a route is considered publication-ready.',
    '/contact':
      'Use the contact route to submit corrections, suggest primary sources, and report safety-critical issues that require editorial review.',
    '/learning':
      'Learning paths provide structured navigation through herb profiles, compounds, and safety-first workflow pages for staged exploration.',
  }

  if (route === '/') {
    return `
    <main id="main" class="container-page py-8 text-white">
      <section>
        <h1>The Hippie Scientist</h1>
        <p>Science-first herbal education with practical safety context, mechanism notes, and curated references.</p>
      </section>
      <section>
        <h2>Explore top sections</h2>
        <ul>
          <li><a href="/blog">Research Notebook</a></li>
          <li><a href="/herbs">Herb database</a></li>
          <li><a href="/compounds">Compound database</a></li>
          <li><a href="/collections/herbs-for-sleep">SEO collections</a></li>
        </ul>
      </section>
    </main>`
  }

  if (route === '/blog') {
    const cards = blogPosts.slice(0, 10).map(post => {
      const slug = escapeHtml(post.slug || '')
      const title = escapeHtml(post.title || slug || 'Research note')
      const summary = escapeHtml(post.summary || post.description || 'Research note entry.')
      return `<li><article><h2><a href="/blog/${slug}">${title}</a></h2><p>${summary}</p></article></li>`
    })

    return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1>${makeCardList(cards, 'No posts available.')}</main>`
  }

  if (staticContentByRoute[route]) {
    return `<main id="main" class="container-page py-8 text-white"><article><h1>${heading}</h1><p>${escapeHtml(staticContentByRoute[route])}</p><p>For the latest interactive modules, open this route in the app shell; this prerendered version preserves canonical metadata and an indexable editorial summary.</p></article></main>`
  }

  if (route.startsWith('/blog/')) {
    const slug = route.split('/').pop() || ''
    const post = blogBySlug.get(slug)
    const postTitle = escapeHtml(post?.title || heading)
    const summary = escapeHtml(post?.summary || post?.description || 'Research note entry.')
    const postBodyPath = path.join(ROOT, 'public', 'blogdata', 'posts', `${slug}.html`)
    const rawBody = fs.existsSync(postBodyPath)
      ? fs.readFileSync(postBodyPath, 'utf8')
      : `<p>Blog content for ${escapeHtml(slug)} is not available in prerender assets.</p>`

    return `<main id="main" class="container-page py-8 text-white"><article><h1>${postTitle}</h1><p>${summary}</p>${rawBody}</article></main>`
  }

  if (route === '/herbs') {
    const herbCards = herbCardsFromManifest.map(item => {
      const slug = escapeHtml(item.slug)
      const name = escapeHtml(textFrom(item.herb?.common, item.herb?.commonName, item.herb?.name, slug))
      const description = escapeHtml(textFrom(item.herb?.summary, item.herb?.description, 'Herb profile'))
      return `<li><article><h2><a href="/herbs/${slug}">${name}</a></h2><p>${description}</p></article></li>`
    })

    return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1>${makeCardList(herbCards, 'Herb profiles are currently unavailable.')}</main>`
  }

  if (route.startsWith('/herbs/')) {
    const slug = route.split('/').pop() || ''
    const herb = readDetailJson('herbs-detail', slug) || herbBySlug.get(slug)
    const displayName = safeStr(herb?.common) || safeStr(herb?.commonName) || safeStr(herb?.name) || slug
    const name = escapeHtml(displayName)
    const description = escapeHtml(
      safeStr(herb?.summary) || safeStr(herb?.description) || `${displayName} herb profile.`
    )
    const effects = textList(herb?.effects, 8).map(effect => `<li>${escapeHtml(effect)}</li>`)
    const warnings = textList(herb?.contraindications, 6).map(item => `<li>${escapeHtml(item)}</li>`)

    const intro = routeDescription && routeDescription !== description ? `<p>${routeDescription}</p>` : ''
    return `<main id="main" class="container-page py-8 text-white"><article><h1>${name}</h1>${intro}<p>${description}</p><section><h2>Tracked effects</h2>${makeCardList(effects, 'Effect data pending; editorial review continues as new references are validated.')}</section><section><h2>Safety notes</h2>${makeCardList(warnings, 'No contraindications listed in the source dataset yet. Use conservative assumptions and review interactions.')}</section></article></main>`
  }

  if (route === '/compounds') {
    const compoundCards = compoundCardsFromManifest.map(item => {
      const slug = escapeHtml(item.slug)
      const name = escapeHtml(textFrom(item.compound?.name, slug))
      const description = escapeHtml(textFrom(item.compound?.description, item.compound?.summary, 'Compound profile'))
      return `<li><article><h2><a href="/compounds/${slug}">${name}</a></h2><p>${description}</p></article></li>`
    })

    return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1><p>Compound pages include educational summaries, safety context, and evidence-aware metadata for discovery and routing stability.</p>${makeCardList(compoundCards, 'Compound profiles are currently unavailable; this index remains available for canonical routing and metadata stability.')}</main>`
  }

  if (route.startsWith('/compounds/')) {
    const slug = route.split('/').pop() || ''
    const compound = readDetailJson('compounds-detail', slug) || compoundBySlug.get(slug)
    const name = escapeHtml(textFrom(compound?.name, slug))
    const description = escapeHtml(inferCompoundDescription(compound, textFrom(compound?.name, slug)))
    const effects = textList(compound?.effects, 8)
      .filter(effect => !/(^|\b)(adaptogen|stress relief|anti-stress|immune support)\b/i.test(effect))
      .map(effect => `<li>${escapeHtml(effect)}</li>`)
    const interactions = textList(compound?.interactions, 6).map(item => `<li>${escapeHtml(item)}</li>`)
    const intro = routeDescription && routeDescription !== description ? `<p>${routeDescription}</p>` : ''
    return `<main id="main" class="container-page py-8 text-white"><article><h1>${name}</h1>${intro}<p>${description}</p><section><h2>Tracked effects</h2>${makeCardList(effects, 'Effect data pending while this compound remains under active evidence review.')}</section><section><h2>Interaction notes</h2>${makeCardList(interactions, 'No interactions listed in the source dataset yet; verify with primary references before use decisions.')}</section></article></main>`
  }

  if (route.startsWith('/best-herbs-for-')) {
    const intentName = route.replace('/best-herbs-for-', '').replace(/-/g, ' ')
    const herbCards = herbCardsFromManifest.slice(0, 10).map(item => {
      const slug = escapeHtml(item.slug)
      const name = escapeHtml(textFrom(item.herb?.common, item.herb?.commonName, item.herb?.name, slug))
      const description = escapeHtml(textFrom(item.herb?.summary, item.herb?.description, 'Evidence-aware herb profile'))
      return `<li><article><h3><a href="/herbs/${slug}">${name}</a></h3><p>${description}</p></article></li>`
    })

    return `<main id="main" class="container-page py-8 text-white"><article><h1>${heading}</h1><p>This entry page is designed for readers searching for the best herbs for ${escapeHtml(
      intentName
    )}. It provides a fast shortlist of commonly compared options and links to full herb profiles with interactions, contraindications, and evidence context.</p><section><h2>How to use this page</h2><p>Start with one herb that fits your routine, read the detailed safety notes, and avoid stacking multiple new products at once. These summaries are educational and should be paired with conservative decision-making.</p></section><section><h2>Herbs to compare first</h2>${makeCardList(herbCards, 'No herb profiles are currently available for this entry page.')}</section></article></main>`
  }

  if (route.startsWith('/herbs-for-')) {
    const goalName = route.replace('/herbs-for-', '').replace(/-/g, ' ')
    const herbCards = herbCardsFromManifest.slice(0, 10).map(item => {
      const slug = escapeHtml(item.slug)
      const name = escapeHtml(textFrom(item.herb?.common, item.herb?.commonName, item.herb?.name, slug))
      const description = escapeHtml(textFrom(item.herb?.summary, item.herb?.description, 'Evidence-aware herb profile'))
      return `<li><article><h2><a href="/herbs/${slug}">${name}</a></h2><p>${description}</p></article></li>`
    })
    return `<main id="main" class="container-page py-8 text-white"><article><h1>${heading}</h1><p>This goal route curates herbs linked to ${escapeHtml(
      goalName
    )} signals and routes readers toward full safety notes, interactions, and mechanism context.</p><section><h2>Related herbs</h2>${makeCardList(herbCards, 'No herb profiles are currently available for this goal route.')}</section></article></main>`
  }

  if (route.startsWith('/collections/')) {
    const slug = route.split('/').pop() || ''
    const collection = collectionBySlug.get(slug)
    const intro = escapeHtml(safeStr(collection?.intro))
    const description = escapeHtml(safeStr(collection?.description))
    const whoFor = escapeHtml(safeStr(collection?.editorial?.whoFor))
    const selectionRationale = escapeHtml(safeStr(collection?.editorial?.selectionRationale))
    const cautions = Array.isArray(collection?.editorial?.cautions)
      ? collection.editorial.cautions
          .map(item => escapeHtml(safeStr(item)))
          .filter(Boolean)
          .map(item => `<li>${item}</li>`)
      : []
    const exclusions = Array.isArray(collection?.editorial?.exclusions)
      ? collection.editorial.exclusions
          .map(item => escapeHtml(safeStr(item)))
          .filter(Boolean)
          .map(item => `<li>${item}</li>`)
      : []
    const ctaLabel = escapeHtml(safeStr(collection?.editorial?.ctaLabel))
    const alternatives = Array.isArray(collection?.editorial?.alternatives)
      ? collection.editorial.alternatives
          .slice(0, 8)
          .map(item => {
            const nextSlug = escapeHtml(String(item))
            const nextCollection = collectionBySlug.get(String(item))
            const label = escapeHtml(safeStr(nextCollection?.title) || String(item).replace(/-/g, ' '))
            return `<li><a href="/collections/${nextSlug}">${label}</a></li>`
          })
      : []
    const relatedLinks = Array.isArray(collection?.relatedSlugs)
      ? collection.relatedSlugs
          .slice(0, 8)
          .map(
            related =>
              `<li><a href="/collections/${escapeHtml(String(related))}">${escapeHtml(
                String(related).replace(/-/g, ' ')
              )}</a></li>`
          )
      : []
    const topHerbs = herbCardsFromManifest
      .slice(0, 8)
      .map(item => {
        const name = escapeHtml(textFrom(item.herb?.common, item.herb?.commonName, item.herb?.name, item.slug))
        return `<li><a href="/herbs/${escapeHtml(item.slug)}">${name}</a></li>`
      })
    const topCompounds = compoundCardsFromManifest
      .slice(0, 8)
      .map(item => {
        const name = escapeHtml(textFrom(item.compound?.name, item.slug))
        return `<li><a href="/compounds/${escapeHtml(item.slug)}">${name}</a></li>`
      })

    return `<main id="main" class="container-page py-8 text-white"><article><h1>${heading}</h1><p>${routeDescription || intro}</p><p>${intro}</p><p>${description}</p><section><h2>Who this page is for</h2><p>${whoFor || 'Audience guidance is being revised.'}</p></section><section><h2>How items were selected</h2><p>${selectionRationale || 'Selection criteria are being revised.'}</p></section><section><h2>Cautions and scope</h2>${makeCardList([...cautions, ...exclusions], 'Caution framing is being reviewed before publication.')}</section><section><h2>What to do next</h2><p>${ctaLabel || 'Open the interaction checker before trying combinations.'}</p></section><section><h2>Related alternatives</h2>${makeCardList(alternatives, 'Related alternatives are being curated.')}</section><section><h2>Related collections</h2>${makeCardList(relatedLinks, 'Related collections are being curated.')}</section><section><h2>Herb profiles</h2>${makeCardList(topHerbs, 'No herb profiles are currently available.')}</section><section><h2>Compound profiles</h2>${makeCardList(topCompounds, 'No compound profiles are currently available.')}</section></article></main>`
  }

  return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1><p>This route is prerendered for SEO metadata. Interactive content loads after hydration.</p></main>`
}

function renderPrerenderNoscript(route) {
  const noscriptWrap = content =>
    `<noscript><div class="prerender-content sr-only">${content}</div></noscript>`

  if (route.startsWith('/herbs/')) {
    const slug = route.split('/').pop() || ''
    const herb = readDetailJson('herbs-detail', slug) || herbBySlug.get(slug)
    const displayName = safeStr(herb?.common) || safeStr(herb?.commonName) || safeStr(herb?.name) || slug
    const description = trimToChars(
      safeStr(herb?.description) || safeStr(herb?.summary) || `${displayName} herb profile.`,
      500
    )
    const activeCompounds = textList(
      herb?.activeCompounds || herb?.active_compounds || herb?.constituents || herb?.compounds,
      10
    )
    const mechanismSummary = textFrom(
      herb?.mechanismSummary,
      herb?.mechanism,
      herb?.mechanismOfAction,
      herb?.moaSummary
    )
    const safetyNotes = textFrom(
      herb?.safetyNotes,
      herb?.safety,
      herb?.warning,
      herb?.warnings,
      herb?.contraindicationsSummary
    )
    const contraindications = textList(herb?.contraindications, 8)
    const safetyItems = [...(safetyNotes ? [safetyNotes] : []), ...contraindications].slice(0, 8)

    return noscriptWrap(
      `<article><h1>${escapeHtml(displayName)}</h1><p>${escapeHtml(description)}</p>${
        activeCompounds.length
          ? `<section><h2>Active compounds</h2><ul>${activeCompounds
              .map(item => `<li>${escapeHtml(item)}</li>`)
              .join('')}</ul></section>`
          : ''
      }${
        mechanismSummary
          ? `<section><h2>Mechanism summary</h2><p>${escapeHtml(mechanismSummary)}</p></section>`
          : ''
      }${
        safetyItems.length
          ? `<section><h2>Safety notes</h2><ul>${safetyItems
              .map(item => `<li>${escapeHtml(item)}</li>`)
              .join('')}</ul></section>`
          : ''
      }</article>`
    )
  }

  if (route.startsWith('/compounds/')) {
    const slug = route.split('/').pop() || ''
    const compound = readDetailJson('compounds-detail', slug) || compoundBySlug.get(slug)
    const name = textFrom(compound?.name, slug)
    const description = trimToChars(
      textFrom(compound?.description, compound?.summary, `${name || slug} compound profile.`),
      500
    )
    const relatedHerbs = textList(compound?.herbs || compound?.sourceHerbs || compound?.plants, 10)
    const mechanismSummary = textFrom(
      compound?.mechanismSummary,
      compound?.mechanism,
      compound?.mechanismOfAction,
      compound?.pharmacology
    )
    const safetyNotes = textFrom(
      compound?.safetyNotes,
      compound?.safety,
      compound?.warning,
      compound?.warnings
    )
    const interactions = textList(compound?.interactions, 8)
    const safetyItems = [...(safetyNotes ? [safetyNotes] : []), ...interactions].slice(0, 8)

    return noscriptWrap(
      `<article><h1>${escapeHtml(name || slug)}</h1><p>${escapeHtml(description)}</p>${
        relatedHerbs.length
          ? `<section><h2>Common source herbs</h2><ul>${relatedHerbs
              .map(item => `<li>${escapeHtml(item)}</li>`)
              .join('')}</ul></section>`
          : ''
      }${
        mechanismSummary
          ? `<section><h2>Mechanism summary</h2><p>${escapeHtml(mechanismSummary)}</p></section>`
          : ''
      }${
        safetyItems.length
          ? `<section><h2>Safety notes</h2><ul>${safetyItems
              .map(item => `<li>${escapeHtml(item)}</li>`)
              .join('')}</ul></section>`
          : ''
      }</article>`
    )
  }

  return ''
}

function render(route) {
  const head = buildHead(route)
  const bodyContent = renderRouteContent(route)
  const noscriptContent = renderPrerenderNoscript(route)
  const sanitizeHead = value =>
    HEAD_REPLACE_PATTERNS.reduce((next, pattern) => next.replace(pattern, ''), value)

  let html = sanitizeHead(indexTemplate)
  html = html.includes('<!--prerender-head-->')
    ? html.replace('<!--prerender-head-->', head)
    : html.replace('</head>', `    ${head}\n  </head>`)

  const hiddenPrerender = `<div id="prerender-static-content" class="sr-only" aria-hidden="true">${bodyContent}</div>`
  const rootNode = '<div id="root"></div>'
  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', `${hiddenPrerender}\n    ${rootNode}`)
  } else {
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `${hiddenPrerender}\n    ${rootNode}`)
  }

  if (noscriptContent) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n    ${noscriptContent}`)
  }

  return html
}

let generated = 0
for (const rawRoute of routes) {
  const route = normalize(rawRoute)
  const destination =
    route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.slice(1), 'index.html')

  ensureDir(path.dirname(destination))
  fs.writeFileSync(destination, render(route), 'utf8')
  generated += 1
}

console.log(
  `[prerender-static] generated ${generated} route HTML files with route-specific head + body content. total planned: ${routes.length}. cap=${metadata.entityCap}`
)
