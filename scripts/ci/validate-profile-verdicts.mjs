import fs from 'node:fs'
import path from 'node:path'

/**
 * Guards the editorial verdict overlay (config/profile-verdicts.ts).
 *
 * Every route the overlay links to — betterAlternative.href and each
 * comparisons[].href — must resolve to a real page (directly or through a
 * governed permanent redirect), and every keyed profile must exist in the
 * workbook export. Redirect acceptance mirrors production behavior: the build
 * rewrites redirecting internal hrefs to their final canonical destination, so
 * a declared alias is valid only when its redirect target is itself live.
 */

const ROOT = process.cwd()
const CONFIG = path.join(ROOT, 'config/profile-verdicts.ts')
const src = fs.readFileSync(CONFIG, 'utf8')

const slugSet = (file) => {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
  const rows = Array.isArray(raw) ? raw : raw.items || raw.data || []
  return new Set(rows.map((r) => r.slug).filter(Boolean))
}
const herbSlugs = slugSet('public/data/herbs.json')
const compoundSlugs = slugSet('public/data/compounds.json')

const normalizeRoute = (href) => {
  if (!href?.startsWith('/')) return href
  const [pathname] = href.split(/[?#]/, 1)
  const clean = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  return clean
}

const routeExistsDirectly = (href) => {
  const normalized = normalizeRoute(href)
  const clean = normalized.replace(/^\/+|\/+$/g, '') // strip leading/trailing slashes
  const m = clean.match(/^(herbs|compounds)\/(.+)$/)
  if (m) {
    const [, kind, slug] = m
    return kind === 'herbs' ? herbSlugs.has(slug) : compoundSlugs.has(slug)
  }
  const dir = path.join(ROOT, 'app', clean)
  return (
    fs.existsSync(path.join(dir, 'page.tsx')) ||
    fs.existsSync(path.join(dir, 'page.mdx')) ||
    fs.existsSync(path.join(dir, 'page.ts'))
  )
}

const parseRedirectLines = (text, map) => {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const [source, target, status = ''] = line.split(/\s+/)
    if (!source?.startsWith('/') || !target?.startsWith('/')) continue
    if (!/^30[1278]$/.test(status)) continue
    if (source.includes('*') || target.includes(':')) continue

    const normalizedSource = normalizeRoute(source)
    // Production redirect precedence is first rule wins. Keep the first exact
    // source we encounter; override files are loaded before the base file.
    if (!map.has(normalizedSource)) map.set(normalizedSource, normalizeRoute(target))
  }
}

const permanentRedirects = new Map()
const overrideDir = path.join(ROOT, 'public/redirect-overrides')
if (fs.existsSync(overrideDir)) {
  for (const name of fs.readdirSync(overrideDir).filter((name) => name.endsWith('.txt')).sort()) {
    parseRedirectLines(fs.readFileSync(path.join(overrideDir, name), 'utf8'), permanentRedirects)
  }
}
const baseRedirects = path.join(ROOT, 'public/_redirects')
if (fs.existsSync(baseRedirects)) {
  parseRedirectLines(fs.readFileSync(baseRedirects, 'utf8'), permanentRedirects)
}

const resolveGovernedRoute = (href) => {
  let current = normalizeRoute(href)
  const seen = new Set()

  for (let hop = 0; hop < 12; hop += 1) {
    if (routeExistsDirectly(current)) return { ok: true, final: current, hops: hop }
    if (seen.has(current)) return { ok: false, final: current, hops: hop, reason: 'redirect loop' }
    seen.add(current)

    const next = permanentRedirects.get(current)
    if (!next) return { ok: false, final: current, hops: hop, reason: 'no live route or permanent redirect' }
    current = next
  }

  return { ok: false, final: current, hops: 12, reason: 'redirect depth exceeded' }
}

const errors = []
const redirectedOverlayLinks = []

// Validate every keyed profile exists in the workbook export.
for (const [, key] of src.matchAll(/^\s{2}'?([a-z0-9-]+)'?:\s*\{$/gm)) {
  if (!herbSlugs.has(key) && !compoundSlugs.has(key)) {
    errors.push(`Keyed profile "${key}" is not a real herb or compound slug`)
  }
}

// Validate every linked route resolves. A source-level legacy alias is allowed
// only when an explicit permanent redirect reaches a live canonical page. The
// export pipeline rewrites that href to the final target before deployment.
for (const [, href] of src.matchAll(/href:\s*'([^']+)'/g)) {
  if (!href.startsWith('/')) continue // external / anchor links are out of scope
  const result = resolveGovernedRoute(href)
  if (!result.ok) {
    errors.push(`Dead route in overlay: ${href} (${result.reason}; stopped at ${result.final})`)
  } else if (result.hops > 0) {
    redirectedOverlayLinks.push(`${href} -> ${result.final}`)
  }
}

if (errors.length) {
  console.error('validate-profile-verdicts: FAILED\n - ' + errors.join('\n - '))
  process.exit(1)
}

if (redirectedOverlayLinks.length) {
  const unique = [...new Set(redirectedOverlayLinks)]
  console.log(
    `validate-profile-verdicts: ${redirectedOverlayLinks.length} overlay link(s) use ${unique.length} governed redirect alias(es); export rewrite will canonicalize them`,
  )
  for (const redirect of unique) console.log(` - ${redirect}`)
}

console.log('validate-profile-verdicts: OK (all keyed profiles and linked routes resolve)')
