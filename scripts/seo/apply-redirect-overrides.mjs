import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const redirectsPath = path.join(outDir, '_redirects')
const overridesDir = path.join(root, 'public', 'redirect-overrides')

if (!fs.existsSync(overridesDir)) {
  console.log('[redirect-overrides] No public/redirect-overrides directory found; skipping.')
  process.exit(0)
}

if (!fs.existsSync(redirectsPath)) {
  console.warn('[redirect-overrides] out/_redirects not found; skipping redirect override merge.')
  process.exit(0)
}

const overrideFiles = fs.readdirSync(overridesDir)
  .filter((fileName) => /\.(txt|redirects)$/i.test(fileName))
  .sort()

const rules = []
const seenSources = new Set()

function sourceVariants(source) {
  if (!source.startsWith('/') || source === '/' || source.includes('*') || source.includes(':')) {
    return [source]
  }

  return source.endsWith('/')
    ? [source, source.replace(/\/+$/, '')]
    : [source, `${source}/`]
}

function addRule(source, target, status) {
  if (!source || !target) return
  if (seenSources.has(source)) return

  seenSources.add(source)
  rules.push(`${source} ${target} ${status}`)
}

for (const fileName of overrideFiles) {
  const filePath = path.join(overridesDir, fileName)
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const [source, target, status = '301'] = trimmed.split(/\s+/)
    if (!source || !target) continue

    for (const variant of sourceVariants(source)) {
      addRule(variant, target, status)
    }
  }
}

if (rules.length === 0) {
  console.log('[redirect-overrides] No redirect override rules found; skipping.')
  process.exit(0)
}

const existing = fs.readFileSync(redirectsPath, 'utf8').trimStart()
const header = [
  '# Redirect overrides merged during build.',
  '# These rules are intentionally prepended so exact audit-cleanup rules win over older wildcard or stale targets.',
  '# Exact slash and non-slash variants are generated automatically for path redirects.',
]
const mergedRedirects = `${header.join('\n')}\n${rules.join('\n')}\n\n${existing}`

fs.writeFileSync(redirectsPath, mergedRedirects)

function normalizeRoute(value) {
  const clean = String(value || '').split(/[?#]/)[0].trim()
  if (!clean.startsWith('/')) return null
  if (clean === '/') return '/'
  return clean.replace(/\/+$/, '') || '/'
}

function canonicalHref(route) {
  if (route === '/') return '/'
  const finalSegment = route.split('/').filter(Boolean).at(-1) || ''
  if (finalSegment.includes('.')) return route
  return `${route.replace(/\/+$/, '')}/`
}

function parseExactRedirects(contents) {
  const redirectMap = new Map()

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const [source, target, status = '301'] = trimmed.split(/\s+/)
    if (!/^30[1278]$/.test(status)) continue
    if (!source?.startsWith('/') || !target?.startsWith('/')) continue
    if (source.includes('*') || source.includes(':') || target.includes('*') || target.includes(':')) continue

    const normalizedSource = normalizeRoute(source)
    const normalizedTarget = normalizeRoute(target)
    if (!normalizedSource || !normalizedTarget || normalizedSource === normalizedTarget) continue

    // The first rule wins in Cloudflare's redirect table. Preserve that same
    // precedence when deciding which internal href to write.
    if (!redirectMap.has(normalizedSource)) {
      redirectMap.set(normalizedSource, normalizedTarget)
    }
  }

  return redirectMap
}

function resolveRedirectTarget(source, redirectMap) {
  let current = source
  const visited = new Set([source])

  for (let depth = 0; depth < 12; depth += 1) {
    const next = redirectMap.get(current)
    if (!next || visited.has(next)) break
    visited.add(next)
    current = next
  }

  return current === source ? null : current
}

function* walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next' || entry.name === 'pagefind') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walkHtmlFiles(fullPath)
    else if (entry.isFile() && entry.name.endsWith('.html')) yield fullPath
  }
}

function rewriteRedirectingInternalLinks(redirectMap) {
  let touchedFiles = 0
  let rewrittenLinks = 0
  const hrefPattern = /href=(["'])(\/[^"']*)\1/gi

  for (const filePath of walkHtmlFiles(outDir)) {
    const html = fs.readFileSync(filePath, 'utf8')
    const next = html.replace(hrefPattern, (match, quote, href) => {
      const suffixIndex = href.search(/[?#]/)
      const pathname = suffixIndex >= 0 ? href.slice(0, suffixIndex) : href
      const suffix = suffixIndex >= 0 ? href.slice(suffixIndex) : ''
      const normalizedSource = normalizeRoute(pathname)
      if (!normalizedSource) return match

      const finalTarget = resolveRedirectTarget(normalizedSource, redirectMap)
      if (!finalTarget) return match

      rewrittenLinks += 1
      return `href=${quote}${canonicalHref(finalTarget)}${suffix}${quote}`
    })

    if (next !== html) {
      fs.writeFileSync(filePath, next)
      touchedFiles += 1
    }
  }

  return { touchedFiles, rewrittenLinks }
}

const exactRedirectMap = parseExactRedirects(mergedRedirects)
const repairResult = rewriteRedirectingInternalLinks(exactRedirectMap)

console.log(
  `[redirect-overrides] Prepended ${rules.length} redirect override rules and rewrote ${repairResult.rewrittenLinks} internal redirect links in ${repairResult.touchedFiles} HTML files.`,
)
