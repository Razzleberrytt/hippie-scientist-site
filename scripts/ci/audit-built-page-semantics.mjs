#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const REPORT_DIR = path.join(ROOT, 'public', 'data', 'reports')
const STRICT = process.argv.includes('--strict')
const REQUIRE_BUILT = process.argv.includes('--require-built')
const SITE_ORIGIN = 'https://thehippiescientist.net'

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(absolute))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute)
  }
  return files
}

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, ' ')
    .trim()
}

function attr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return decodeHtml(match?.[1] ?? match?.[2] ?? match?.[3] ?? '')
}

function firstTagContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
  return decodeHtml(match?.[1] ?? '')
}

function allTagContents(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi'))]
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean)
}

function routeForFile(file) {
  const relative = path.relative(OUT_DIR, file).replaceAll(path.sep, '/')
  if (relative === 'index.html') return '/'
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}/`
  return `/${relative.replace(/\.html$/, '')}/`
}

function normalizeRoute(route) {
  return route === '/' ? '/' : `/${route.replace(/^\/+|\/+$/g, '')}/`
}

function pushGrouped(map, key, route) {
  if (!key) return
  const normalized = key.toLowerCase().replace(/\s+/g, ' ').trim()
  map.set(normalized, [...(map.get(normalized) ?? []), route])
}

function duplicateGroups(map, minCount = 2) {
  return [...map.entries()]
    .filter(([, routes]) => routes.length >= minCount)
    .map(([value, routes]) => ({ value, routes }))
    .sort((a, b) => b.routes.length - a.routes.length || a.value.localeCompare(b.value))
}

function markdown(report) {
  const lines = [
    '# Built page semantics audit',
    '',
    `Scanned **${report.summary.pages}** HTML pages; **${report.summary.indexablePages}** were indexable.`,
    '',
    `- Errors: **${report.summary.errors}**`,
    `- Warnings: **${report.summary.warnings}**`,
    `- Duplicate H1 groups: **${report.summary.duplicateH1Groups}**`,
    `- Duplicate title groups: **${report.summary.duplicateTitleGroups}**`,
    `- Excessively duplicated description groups: **${report.summary.excessiveDescriptionGroups}**`,
    '',
  ]

  if (report.errors.length) {
    lines.push('## Errors', '')
    for (const issue of report.errors) lines.push(`- \`${issue.route}\` — ${issue.message}`)
    lines.push('')
  }
  if (report.warnings.length) {
    lines.push('## Warnings', '')
    for (const issue of report.warnings.slice(0, 100)) lines.push(`- \`${issue.route}\` — ${issue.message}`)
    lines.push('')
  }
  if (report.duplicateH1s.length) {
    lines.push('## Repeated H1s', '')
    for (const group of report.duplicateH1s.slice(0, 50)) {
      lines.push(`- **${group.value}** — ${group.routes.map((route) => `\`${route}\``).join(', ')}`)
    }
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

if (!fs.existsSync(OUT_DIR)) {
  const message = '[built-page-semantics] out/ does not exist; run a production build first'
  if (REQUIRE_BUILT) {
    console.error(message)
    process.exit(1)
  }
  console.log(`${message}; skipping built HTML audit`)
  process.exit(0)
}

const files = walk(OUT_DIR)
const errors = []
const warnings = []
const h1ByText = new Map()
const titleByText = new Map()
const descriptionByText = new Map()
const canonicalByUrl = new Map()
let indexablePages = 0

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8')
  const route = routeForFile(file)
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? []
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? []
  const robotsTag = metaTags.find((tag) => attr(tag, 'name').toLowerCase() === 'robots')
  const robots = attr(robotsTag ?? '', 'content').toLowerCase()
  const indexable = !robots.includes('noindex') && !['/404/', '/500/'].includes(normalizeRoute(route))
  if (!indexable) continue
  indexablePages += 1

  const title = firstTagContent(html, 'title')
  const descriptionTag = metaTags.find((tag) => attr(tag, 'name').toLowerCase() === 'description')
  const description = attr(descriptionTag ?? '', 'content')
  const h1s = allTagContents(html, 'h1')
  const canonicalTags = linkTags.filter((tag) => attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'))
  const canonical = attr(canonicalTags[0] ?? '', 'href')

  if (!title) errors.push({ route, message: 'missing <title>' })
  if (!description) errors.push({ route, message: 'missing meta description' })
  if (h1s.length === 0) errors.push({ route, message: 'missing H1' })
  if (h1s.length > 1) warnings.push({ route, message: `contains ${h1s.length} H1 elements; prefer one page-level H1` })
  if (canonicalTags.length !== 1) errors.push({ route, message: `expected exactly one canonical tag; found ${canonicalTags.length}` })

  if (canonical) {
    try {
      const url = new URL(canonical)
      if (url.origin !== SITE_ORIGIN) errors.push({ route, message: `canonical uses unexpected origin: ${url.origin}` })
      if (url.search || url.hash) errors.push({ route, message: 'canonical contains query parameters or a fragment' })
      pushGrouped(canonicalByUrl, canonical, route)
    } catch {
      errors.push({ route, message: `canonical is not a valid absolute URL: ${canonical}` })
    }
  }

  if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) {
    errors.push({ route, message: 'missing html[lang] accessibility attribute' })
  }
  if (!/<main\b/i.test(html)) warnings.push({ route, message: 'missing semantic <main> landmark' })

  const imageTags = html.match(/<img\b[^>]*>/gi) ?? []
  const imagesWithoutAlt = imageTags.filter((tag) => {
    const role = attr(tag, 'role').toLowerCase()
    const ariaHidden = attr(tag, 'aria-hidden').toLowerCase()
    return !/\balt\s*=/.test(tag) && role !== 'presentation' && ariaHidden !== 'true'
  })
  if (imagesWithoutAlt.length) {
    warnings.push({ route, message: `${imagesWithoutAlt.length} image(s) lack alt text or an explicit decorative role` })
  }

  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const [, rawJson] of jsonLdBlocks) {
    try {
      JSON.parse(rawJson.trim())
    } catch {
      errors.push({ route, message: 'contains malformed JSON-LD structured data' })
    }
  }

  pushGrouped(titleByText, title, route)
  pushGrouped(descriptionByText, description, route)
  for (const h1 of h1s) pushGrouped(h1ByText, h1, route)
}

const duplicateTitles = duplicateGroups(titleByText, 2)
const duplicateH1s = duplicateGroups(h1ByText, 2)
const excessiveDescriptions = duplicateGroups(descriptionByText, 3)
const duplicateCanonicals = duplicateGroups(canonicalByUrl, 2)

for (const group of duplicateTitles) {
  errors.push({ route: group.routes.join(', '), message: `duplicate page title: “${group.value}”` })
}
for (const group of duplicateCanonicals) {
  errors.push({ route: group.routes.join(', '), message: `duplicate canonical URL: ${group.value}` })
}
for (const group of duplicateH1s) {
  const issue = { route: group.routes.join(', '), message: `repeated H1 across ${group.routes.length} indexable pages: “${group.value}”` }
  if (group.routes.length >= 3) errors.push(issue)
  else warnings.push(issue)
}
for (const group of excessiveDescriptions) {
  errors.push({ route: group.routes.join(', '), message: `meta description repeated across ${group.routes.length} indexable pages` })
}

const report = {
  generatedAt: new Date().toISOString(),
  strict: STRICT,
  summary: {
    pages: files.length,
    indexablePages,
    errors: errors.length,
    warnings: warnings.length,
    duplicateH1Groups: duplicateH1s.length,
    duplicateTitleGroups: duplicateTitles.length,
    excessiveDescriptionGroups: excessiveDescriptions.length,
  },
  duplicateTitles,
  duplicateH1s,
  excessiveDescriptions,
  duplicateCanonicals,
  errors,
  warnings,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(path.join(REPORT_DIR, 'built-page-semantics.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(REPORT_DIR, 'built-page-semantics.md'), markdown(report))

console.log('\nBuilt page semantics audit')
console.log('='.repeat(60))
console.log(`HTML pages       ${report.summary.pages}`)
console.log(`Indexable pages  ${report.summary.indexablePages}`)
console.log(`Errors           ${report.summary.errors}`)
console.log(`Warnings         ${report.summary.warnings}`)
console.log(`Repeated H1s     ${report.summary.duplicateH1Groups}`)
console.log(`Report           public/data/reports/built-page-semantics.md`)

if (STRICT && errors.length) process.exit(1)
