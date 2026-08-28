import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const SITE_ORIGIN = 'https://thehippiescientist.net'
export const FREEZE_POLICY_PATHS = [
  'app/herbs/[slug]/page.tsx',
  'app/sitemap.ts',
  'src/lib/seo.ts',
  'src/lib/index-allowlist.ts',
  'lib/sitemap-route-visibility.ts',
  'public/_redirects',
]

export function normalizePathname(value) {
  if (!value) return null
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname
  } catch {
    return null
  }
  const pathOnly = String(value).split(/[?#]/)[0] || '/'
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function normalizeText(value) {
  return decodeEntities(value).replace(/\s+/g, ' ').trim()
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? '') : ''
}

function canonicalUrlFromHtml(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attribute(match[0], 'rel').toLowerCase().split(/\s+/)
    if (rel.includes('canonical')) return attribute(match[0], 'href')
  }
  return ''
}

function robotsFromHtml(html) {
  const directives = []
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = attribute(match[0], 'name').toLowerCase()
    if (name === 'robots' || name === 'googlebot') {
      directives.push(attribute(match[0], 'content').toLowerCase())
    }
  }
  return directives.filter(Boolean)
}

function descriptionFromHtml(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(match[0], 'name').toLowerCase() === 'description') {
      return normalizeText(attribute(match[0], 'content'))
    }
  }
  return ''
}

function titleFromHtml(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  return normalizeText(match?.[1] ?? '')
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, stableClone(value[key])]),
  )
}

function jsonLdFromHtml(html) {
  const values = []
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const raw = decodeEntities(match[1]).trim()
    if (!raw) continue
    try {
      values.push(stableClone(JSON.parse(raw)))
    } catch {
      values.push(normalizeText(raw))
    }
  }
  return values
}

function mainVisibleText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html
  return normalizeText(
    main
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

function normalizedCanonical(value) {
  try {
    const url = new URL(value, SITE_ORIGIN)
    return `${url.origin}${normalizePathname(url.pathname)}`
  } catch {
    return ''
  }
}

function expectedCanonical(pathname) {
  return `${SITE_ORIGIN}${pathname === '/' ? '' : pathname}`
}

function htmlFileForPath(buildDir, pathname) {
  const clean = pathname.replace(/^\//, '')
  const candidates = pathname === '/'
    ? [path.join(buildDir, 'index.html')]
    : [
        path.join(buildDir, clean, 'index.html'),
        path.join(buildDir, `${clean}.html`),
      ]
  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

function readRedirectSources(buildDir) {
  const filePath = path.join(buildDir, '_redirects')
  const sources = new Set()
  if (!existsSync(filePath)) return sources
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [source, target, status] = trimmed.split(/\s+/)
    if (!source || source.includes('*') || !/^30[1278]$/.test(status ?? '')) continue
    const sourcePath = normalizePathname(source)
    const targetPath = normalizePathname(target)
    if (sourcePath && sourcePath !== targetPath) sources.add(sourcePath)
  }
  return sources
}

export function readBuiltSitemap(buildDir = 'out') {
  const filePath = path.join(buildDir, 'sitemap.xml')
  if (!existsSync(filePath)) throw new Error(`Built sitemap not found: ${filePath}`)
  const xml = readFileSync(filePath, 'utf8')
  const entries = new Map()
  for (const match of xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)) {
    const block = match[1]
    const loc = decodeEntities(block.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i)?.[1] ?? '').trim()
    if (!loc) continue
    const pathname = normalizePathname(loc)
    if (!pathname) continue
    const lastmod = normalizeText(block.match(/<lastmod\b[^>]*>([\s\S]*?)<\/lastmod>/i)?.[1] ?? '') || null
    entries.set(pathname, { loc, lastmod })
  }
  if (entries.size === 0) throw new Error(`Built sitemap contains no <url> entries: ${filePath}`)
  return entries
}

export function snapshotBuiltHerb(pathname, buildDir = 'out', sitemap = readBuiltSitemap(buildDir)) {
  const normalizedPath = normalizePathname(pathname)
  if (!normalizedPath || !/^\/herbs\/[^/]+$/.test(normalizedPath)) {
    throw new Error(`Not a canonical herb path: ${pathname}`)
  }

  const sitemapEntry = sitemap.get(normalizedPath)
  if (!sitemapEntry) throw new Error(`Herb is absent from final built sitemap: ${normalizedPath}`)

  const redirectSources = readRedirectSources(buildDir)
  if (redirectSources.has(normalizedPath)) {
    throw new Error(`Herb is a redirect source in final build: ${normalizedPath}`)
  }

  const htmlPath = htmlFileForPath(buildDir, normalizedPath)
  if (!htmlPath) throw new Error(`Built HTML not found for ${normalizedPath}`)
  const html = readFileSync(htmlPath, 'utf8')
  const canonical = canonicalUrlFromHtml(html)
  if (normalizedCanonical(canonical) !== expectedCanonical(normalizedPath)) {
    throw new Error(`Self-canonical mismatch for ${normalizedPath}: ${canonical || '(missing)'}`)
  }

  const robots = robotsFromHtml(html)
  if (robots.some((value) => /(?:^|[,\s])noindex(?:$|[,\s])/i.test(value))) {
    throw new Error(`Built HTML is noindex for ${normalizedPath}`)
  }

  // Hash only SEO/substantive rendered signals, not raw HTML, asset hashes, styles,
  // or other build noise. This keeps the causal freeze strict without blocking
  // unrelated site evolution that does not change a randomized page's substance.
  const renderedPayload = {
    title: titleFromHtml(html),
    description: descriptionFromHtml(html),
    main_text: mainVisibleText(html),
    json_ld: jsonLdFromHtml(html),
  }
  const renderedSha256 = createHash('sha256').update(JSON.stringify(renderedPayload)).digest('hex')

  return {
    pathname: normalizedPath,
    canonical_url: canonical,
    robots,
    baseline_lastmod: sitemapEntry.lastmod,
    rendered_sha256: renderedSha256,
  }
}

export function freezePolicyHash() {
  const hash = createHash('sha256')
  for (const relativePath of FREEZE_POLICY_PATHS) {
    hash.update(relativePath)
    hash.update('\0')
    hash.update(readFileSync(path.resolve(relativePath)))
    hash.update('\0')
  }
  return hash.digest('hex')
}
