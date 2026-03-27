#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getPrerenderPlan } from './prerender-routes.mjs'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const SITE_URL = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')
const SITE_NAME = 'The Hippie Scientist'

const { routes, routeMeta, metadata } = getPrerenderPlan()

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

const blogPosts = readJson('src/data/blog/posts.json')
const herbs = pickDataFile('public/data/herbs_combined_updated.json', 'public/data/herbs.json')
const compounds = pickDataFile('public/data/compounds_combined_updated.json', 'public/data/compounds.json')
const indexableHerbs = readJson('public/data/indexable-herbs.json')
const indexableCompounds = readJson('public/data/indexable-compounds.json')

const blogBySlug = new Map(blogPosts.map(post => [String(post?.slug || ''), post]))
const herbBySlug = new Map(
  herbs.map(record => {
    const slug = String(record?.slug || '').trim()
    return [slug, record]
  })
)
const compoundBySlug = new Map(
  compounds.map(record => {
    const slug = String(record?.slug || '').trim()
    return [slug, record]
  })
)

const indexableHerbCards = indexableHerbs
  .map(item => {
    const route = String(item?.route || '').trim()
    const slugFromRoute = route.startsWith('/herbs/') ? route.slice('/herbs/'.length) : ''
    const slug = String(item?.slug || slugFromRoute).trim()
    if (!slug) return null
    const herb = herbBySlug.get(slug) || item
    return { slug, herb }
  })
  .filter(Boolean)
  .slice(0, 20)

const indexableCompoundCards = indexableCompounds
  .map(item => {
    const route = String(item?.route || '').trim()
    const slugFromRoute = route.startsWith('/compounds/') ? route.slice('/compounds/'.length) : ''
    const slug = String(item?.slug || slugFromRoute).trim()
    if (!slug) return null
    const compound = compoundBySlug.get(slug) || item
    return { slug, compound }
  })
  .filter(Boolean)
  .slice(0, 20)

function textList(value, limit = 5) {
  const list = Array.isArray(value) ? value : []
  return list
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, limit)
}

function textFrom(...values) {
  for (const value of values) {
    const next = String(value || '').trim()
    if (next) return next
  }
  return ''
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

function buildHead(route) {
  const meta = routeMeta.get(route) || {}
  const title = escapeHtml(meta.title || SITE_NAME)
  const description = escapeHtml(
    meta.description || 'Evidence-aware herbal education and safety context.'
  )
  const canonical = canonicalUrl(route)

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ]

  if (route === '/') {
    tags.push(
      `<script type="application/ld+json">${escapeHtml(JSON.stringify(websiteJsonLd()))}</script>`
    )
  }

  if (route.startsWith('/blog/')) {
    const slug = route.split('/').pop()
    const post = blogBySlug.get(slug || '')
    if (post) {
      tags.push('<meta property="og:type" content="article" />')
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
    const herbCards = indexableHerbCards.map(item => {
      const slug = escapeHtml(item.slug)
      const name = escapeHtml(textFrom(item.herb?.common, item.herb?.commonName, item.herb?.name, slug))
      const description = escapeHtml(textFrom(item.herb?.summary, item.herb?.description, 'Herb profile'))
      return `<li><article><h2><a href="/herbs/${slug}">${name}</a></h2><p>${description}</p></article></li>`
    })

    return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1>${makeCardList(herbCards, 'Indexable herb profiles are currently unavailable.')}</main>`
  }

  if (route.startsWith('/herbs/')) {
    const slug = route.split('/').pop() || ''
    const herb = herbBySlug.get(slug)
    const name = escapeHtml(textFrom(herb?.common, herb?.commonName, herb?.name, slug))
    const description = escapeHtml(textFrom(herb?.description, herb?.summary, 'Herb profile'))
    const effects = textList(herb?.effects, 8).map(effect => `<li>${escapeHtml(effect)}</li>`)
    const warnings = textList(herb?.contraindications, 6).map(item => `<li>${escapeHtml(item)}</li>`)

    return `<main id="main" class="container-page py-8 text-white"><article><h1>${name}</h1><p>${description}</p><section><h2>Tracked effects</h2>${makeCardList(effects, 'Effect data pending.')}</section><section><h2>Safety notes</h2>${makeCardList(warnings, 'No contraindications listed in the source dataset.')}</section></article></main>`
  }

  if (route === '/compounds') {
    const compoundCards = indexableCompoundCards.map(item => {
      const slug = escapeHtml(item.slug)
      const name = escapeHtml(textFrom(item.compound?.name, slug))
      const description = escapeHtml(textFrom(item.compound?.description, item.compound?.summary, 'Compound profile'))
      return `<li><article><h2><a href="/compounds/${slug}">${name}</a></h2><p>${description}</p></article></li>`
    })

    return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1>${makeCardList(compoundCards, 'No indexable compounds currently pass quality thresholds.')}</main>`
  }

  if (route.startsWith('/compounds/')) {
    const slug = route.split('/').pop() || ''
    const compound = compoundBySlug.get(slug)
    const name = escapeHtml(textFrom(compound?.name, slug))
    const description = escapeHtml(textFrom(compound?.description, compound?.summary, 'Compound profile'))
    const effects = textList(compound?.effects, 8).map(effect => `<li>${escapeHtml(effect)}</li>`)
    const interactions = textList(compound?.interactions, 6).map(item => `<li>${escapeHtml(item)}</li>`)

    return `<main id="main" class="container-page py-8 text-white"><article><h1>${name}</h1><p>${description}</p><section><h2>Tracked effects</h2>${makeCardList(effects, 'Effect data pending.')}</section><section><h2>Interaction notes</h2>${makeCardList(interactions, 'No interactions listed in the source dataset.')}</section></article></main>`
  }

  if (route.startsWith('/collections/')) {
    const slug = route.split('/').pop() || ''
    return `<main id="main" class="container-page py-8 text-white"><article><h1>${heading}</h1><p>Collection route: ${escapeHtml(slug)}.</p><p>This curated page groups herbs and compounds for a targeted outcome with safety-first context.</p><p>Open the interactive version to apply filters and build a stack.</p></article></main>`
  }

  return `<main id="main" class="container-page py-8 text-white"><h1>${heading}</h1><p>This route is prerendered for SEO metadata. Interactive content loads after hydration.</p></main>`
}

function render(route) {
  const head = buildHead(route)
  const bodyContent = renderRouteContent(route)

  let html = indexTemplate.includes('<!--prerender-head-->')
    ? indexTemplate.replace('<!--prerender-head-->', head)
    : indexTemplate.replace('</head>', `    ${head}\n  </head>`)

  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`)
  } else {
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${bodyContent}</div>`)
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
