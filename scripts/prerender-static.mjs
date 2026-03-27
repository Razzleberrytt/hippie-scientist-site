#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getPrerenderPlan } from './prerender-routes.mjs'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const SITE_URL = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')

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

function buildHead(route) {
  const meta = routeMeta.get(route) || {}
  const title = escapeHtml(meta.title || 'The Hippie Scientist')
  const description = escapeHtml(meta.description || 'Evidence-aware herbal education and safety context.')
  const canonical = `${SITE_URL}${route === '/' ? '/' : route}`

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="twitter:title" content="${title}" />`,
    `<meta property="twitter:description" content="${description}" />`,
  ].join('\n    ')
}

function render(route) {
  const head = buildHead(route)

  if (indexTemplate.includes('<!--prerender-head-->')) {
    return indexTemplate.replace('<!--prerender-head-->', head)
  }

  return indexTemplate.replace('</head>', `    ${head}\n  </head>`)
}

let generated = 0
for (const rawRoute of routes) {
  const route = normalize(rawRoute)
  if (route === '/') continue

  const destination = path.join(DIST, route.slice(1), 'index.html')
  ensureDir(path.dirname(destination))
  fs.writeFileSync(destination, render(route), 'utf8')
  generated += 1
}

console.log(
  `[prerender-static] generated ${generated} route HTML files (+ dist/index.html). total planned: ${routes.length}. cap=${metadata.entityCap}`
)
