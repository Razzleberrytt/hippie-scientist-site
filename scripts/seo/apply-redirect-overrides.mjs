import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const redirectsPath = path.join(outDir, '_redirects')
const overridesDir = path.join(root, 'public', 'redirect-overrides')
const comparePagesDir = path.join(root, 'app', 'guides', 'compare')

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
const canonicalOverrideSources = new Set()

function sourceVariants(source) {
  if (!source.startsWith('/') || source === '/' || source.includes('*') || source.includes(':')) {
    return [source]
  }

  return source.endsWith('/')
    ? [source, source.replace(/\/+$/, '')]
    : [source, `${source}/`]
}

// Historical SEO/audit exports are intentionally retained as evidence, even
// after a once-missing route becomes a real canonical page. A
// `# @canonical-source /path/` tombstone suppresses any imported override for
// that source (including its slash variant) without emitting a self-redirect.
// This lets current route ownership supersede stale 404-era cleanup safely.
for (const fileName of overrideFiles) {
  const filePath = path.join(overridesDir, fileName)
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const match = line.trim().match(/^#\s*@canonical-source\s+(\S+)\s*$/)
    if (!match) continue
    for (const variant of sourceVariants(match[1])) canonicalOverrideSources.add(variant)
  }
}

function addRule(source, target, status) {
  if (!source || !target) return
  if (canonicalOverrideSources.has(source)) return
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

const BLOCK_START = '# >>> redirect-overrides (generated, do not edit)'
const BLOCK_END = '# <<< redirect-overrides'

// Incremental rebuilds can reach this script with an out/_redirects that already
// carries a merged block (the public/ copy step is cached and does not reset the
// file). Without stripping it first, every rebuild prepends another copy and the
// rule count grows without bound — past Cloudflare's 2000-rule ceiling for Pages,
// where the excess is silently dropped.
function stripPreviousBlock(contents) {
  const start = contents.indexOf(BLOCK_START)
  if (start === -1) return contents
  const end = contents.indexOf(BLOCK_END, start)
  if (end === -1) return contents
  return contents.slice(0, start) + contents.slice(end + BLOCK_END.length)
}

const existing = stripPreviousBlock(fs.readFileSync(redirectsPath, 'utf8')).trimStart()
const header = [
  BLOCK_START,
  '# These rules are intentionally prepended so exact audit-cleanup rules win over older wildcard or stale targets.',
  '# Exact slash and non-slash variants are generated automatically for path redirects.',
]
const mergedRedirects = `${header.join('\n')}\n${rules.join('\n')}\n${BLOCK_END}\n\n${existing}`

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

function readBuiltCompareSlugs() {
  if (!fs.existsSync(comparePagesDir)) return new Set()

  return new Set(
    fs.readdirSync(comparePagesDir, { withFileTypes: true })
      .filter((entry) => {
        if (!entry.isDirectory()) return false
        if (/^\[/.test(entry.name) || entry.name === 'dynamic') return false
        return fs.existsSync(path.join(comparePagesDir, entry.name, 'page.tsx'))
      })
      .map((entry) => entry.name),
  )
}

const builtCompareSlugs = readBuiltCompareSlugs()

function canonicalComparisonRoute(route) {
  const match = route.match(/^\/compare\/([^/]+)$/)
  if (!match) return null

  const slug = match[1]
  if (builtCompareSlugs.has(slug)) return `/guides/compare/${slug}`

  // Internal links should never keep pointing at the retired combinatorial
  // comparison namespace. Sending a rendered internal link to the curated hub
  // is acceptable; redirecting a crawled legacy URL there is not (see the
  // redirect-table pruning below).
  return '/guides/compare'
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

const CANONICAL_HOST = 'thehippiescientist.net'

// `:splat`/`:param` placeholders must survive verbatim. Match a colon that
// starts a path segment so the `https://` protocol colon in the absolute
// www -> apex rules is not mistaken for a placeholder.
const hasPlaceholder = (value) => value.includes('*') || /(^|\/):[a-z]/i.test(value)

/**
 * Returns the pathname a redirect target points at, but only when that target
 * is a path or an absolute URL on our own host. Cross-host targets are left
 * alone: their final destination is decided by the other host, not by this file.
 */
function targetPathname(target) {
  if (target.startsWith('/')) return normalizeRoute(target)

  try {
    const url = new URL(target)
    if (url.hostname.replace(/^www\./, '') !== CANONICAL_HOST) return null
    return normalizeRoute(url.pathname)
  } catch {
    return null
  }
}

/**
 * Retired combinatorial comparison pages have no one-to-one replacement. A
 * redirect from `/compare/foo-vs-bar` to the comparison hub is therefore a
 * soft-404 signal, not recovery. Remove those rules from the deployed table.
 *
 * If a formerly generated pair now has a curated static page, repair the rule
 * to that exact canonical instead of dropping it. This keeps the redirect
 * policy aligned automatically as the curated comparison set changes.
 */
function pruneComparisonHubSoft404s(contents) {
  let removedCount = 0
  let repairedCount = 0

  const lines = []
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      lines.push(line)
      continue
    }

    const [source, target, status = '301'] = trimmed.split(/\s+/)
    if (!source || !target || !/^30[1278]$/.test(status)) {
      lines.push(line)
      continue
    }

    const sourcePath = targetPathname(source)
    const targetPath = targetPathname(target)
    const compareMatch = sourcePath?.match(/^\/compare\/([^/]+)$/)

    if (!compareMatch || targetPath !== '/guides/compare') {
      lines.push(line)
      continue
    }

    const slug = compareMatch[1]
    if (!builtCompareSlugs.has(slug)) {
      removedCount += 1
      continue
    }

    const repairedPath = canonicalHref(`/guides/compare/${slug}`)
    const repairedTarget = target.startsWith('/')
      ? repairedPath
      : new URL(repairedPath, `https://${CANONICAL_HOST}`).toString()

    lines.push(`${source} ${repairedTarget} ${status}`)
    repairedCount += 1
  }

  return { contents: lines.join('\n'), removedCount, repairedCount }
}

/**
 * Collapse multi-hop rules so every source reaches its final destination in one
 * hop.
 *
 * Overrides are *prepended*, so an override that retires page B silently turns
 * every pre-existing `A -> B` rule into a two-hop chain. Cloudflare does not
 * follow chains server-side, so each hop is a real round trip for crawlers and
 * users. `normalize-redirects.mjs` cannot catch these: it checks
 * `public/_redirects`, and these chains only exist after the merge that happens
 * here, at build time.
 */
function flattenRedirectRules(contents, redirectMap) {
  let flattenedCount = 0

  const lines = contents.split(/\r?\n/).map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return line

    const [source, target, status = '301'] = trimmed.split(/\s+/)
    if (!source || !target || !/^30[1278]$/.test(status)) return line
    // Placeholder rules carry a :splat/wildcard through to the target; the
    // resolved path of a template is not a real route, so leave them intact.
    if (hasPlaceholder(source) || hasPlaceholder(target)) return line

    const currentPath = targetPathname(target)
    if (!currentPath) return line

    const finalPath = resolveRedirectTarget(currentPath, redirectMap)
    if (!finalPath) return line

    // A chain that loops back to its own source cannot be flattened into a
    // single hop without creating a self-redirect. Leave it for a human.
    if (finalPath === normalizeRoute(source)) return line

    const rewrittenTarget = target.startsWith('/')
      ? canonicalHref(finalPath)
      : new URL(canonicalHref(finalPath), `https://${CANONICAL_HOST}`).toString()

    flattenedCount += 1
    return `${source} ${rewrittenTarget} ${status}`
  })

  return { contents: lines.join('\n'), flattenedCount }
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
  let repairedCompareLinks = 0
  let collapsedUnbuiltCompareLinks = 0
  const hrefPattern = /href=(["'])(\/[^"']*)\1/gi

  for (const filePath of walkHtmlFiles(outDir)) {
    const html = fs.readFileSync(filePath, 'utf8')
    const next = html.replace(hrefPattern, (match, quote, href) => {
      const suffixIndex = href.search(/[?#]/)
      const pathname = suffixIndex >= 0 ? href.slice(0, suffixIndex) : href
      const suffix = suffixIndex >= 0 ? href.slice(suffixIndex) : ''
      const normalizedSource = normalizeRoute(pathname)
      if (!normalizedSource) return match

      const compareRoute = canonicalComparisonRoute(normalizedSource)
      if (compareRoute) {
        repairedCompareLinks += 1
        if (compareRoute === '/guides/compare') collapsedUnbuiltCompareLinks += 1
        return `href=${quote}${canonicalHref(compareRoute)}${suffix}${quote}`
      }

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

  return { touchedFiles, rewrittenLinks, repairedCompareLinks, collapsedUnbuiltCompareLinks }
}

const comparisonPruneResult = pruneComparisonHubSoft404s(mergedRedirects)
const exactRedirectMap = parseExactRedirects(comparisonPruneResult.contents)
const flattenResult = flattenRedirectRules(comparisonPruneResult.contents, exactRedirectMap)

fs.writeFileSync(redirectsPath, flattenResult.contents)

const repairResult = rewriteRedirectingInternalLinks(exactRedirectMap)

console.log(
  `[redirect-overrides] Prepended ${rules.length} redirect override rules, suppressed ${canonicalOverrideSources.size} restored canonical source variants, pruned ${comparisonPruneResult.removedCount} unbuilt comparison soft-404 redirects, repaired ${comparisonPruneResult.repairedCount} comparison redirects to curated pages, flattened ${flattenResult.flattenedCount} multi-hop redirect rules, rewrote ${repairResult.rewrittenLinks} internal redirect links, repaired ${repairResult.repairedCompareLinks} stale comparison links (${repairResult.collapsedUnbuiltCompareLinks} unbuilt pairs sent to the comparison hub), and touched ${repairResult.touchedFiles} HTML files.`,
)
