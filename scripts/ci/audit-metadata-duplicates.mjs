import fs from 'node:fs'

const manifestPath = 'public/data/runtime-manifests/route-manifest.json'
const routes = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const redirectSources = new Set(
  fs.readFileSync('public/_redirects', 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/)[0])
    .filter((source) => source.startsWith('/') && !source.includes('*'))
    .map((source) => source.length > 1 ? source.replace(/\/+$/, '') : source),
)

const byTitle = new Map()
const byDesc = new Map()
const byCanonical = new Map()
const missingTitles = []
const missingDescriptions = []
const missingCanonicals = []
const invalidCanonicalOrigins = []
const parameterizedCanonicals = []
const canonicalPathMismatches = []
const canonicalSlashMismatches = []

/**
 * Metadata as the page actually ships it.
 *
 * The route manifest carries meta_title/meta_description only for routes built
 * from data. A static app route gets its metadata from the page module's
 * `export const metadata`, which never reaches the manifest, so its entry is
 * blank — and reading the manifest alone reported the homepage, /herbs,
 * /compounds and /goals as missing titles and descriptions they plainly have.
 *
 * Since this audit runs after the build, the rendered HTML is available and is
 * the only source that reflects what search engines will see. The manifest is
 * kept as the primary read (it is cheaper and covers unbuilt routes) with the
 * HTML as the fallback.
 */
function htmlMetadata(routePath) {
  const file = `out${routePath === '/' ? '' : routePath.replace(/\/+$/, '')}/index.html`
  if (!fs.existsSync(file)) return null
  const html = fs.readFileSync(file, 'utf8')
  return {
    title: (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').trim(),
    description: (html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '').trim(),
    canonical: (html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '').trim(),
  }
}

for (const r of routes) {
  const routePath = r.route || r.path || ''
  const normalizedRoute = routePath.length > 1 ? routePath.replace(/\/+$/, '') : routePath
  if (redirectSources.has(normalizedRoute)) continue

  const rendered = htmlMetadata(routePath)
  const title = ((r.meta_title || '').trim() || rendered?.title || '').trim()
  const desc = ((r.meta_description || '').trim() || rendered?.description || '').trim()
  const canonical = ((r.canonical_url || r.url || '').trim() || rendered?.canonical || '').trim()

  if (title) byTitle.set(title, [...(byTitle.get(title) || []), routePath])
  else missingTitles.push(routePath)

  if (desc) byDesc.set(desc, [...(byDesc.get(desc) || []), routePath])
  else missingDescriptions.push(routePath)

  if (canonical) {
    byCanonical.set(canonical, [...(byCanonical.get(canonical) || []), routePath])
    try {
      const canonicalUrl = new URL(canonical)
      if (canonicalUrl.origin !== 'https://thehippiescientist.net') invalidCanonicalOrigins.push({ route: routePath, canonical })
      if (canonicalUrl.search || canonicalUrl.hash) parameterizedCanonicals.push({ route: routePath, canonical })
      const canonicalPath = canonicalUrl.pathname.length > 1 ? canonicalUrl.pathname.replace(/\/+$/, '') : canonicalUrl.pathname
      if (canonicalPath !== normalizedRoute) canonicalPathMismatches.push({ route: routePath, canonical })
      if (canonicalUrl.pathname !== '/' && !canonicalUrl.pathname.endsWith('/')) canonicalSlashMismatches.push({ route: routePath, canonical })
    } catch {
      invalidCanonicalOrigins.push({ route: routePath, canonical })
    }
  } else {
    missingCanonicals.push(routePath)
  }
}

const dup = (map) => [...map.entries()]
  .filter(([, values]) => values.length > 1)
  .map(([value, routeList]) => ({ value, routes: routeList }))

const report = {
  generatedAt: new Date().toISOString(),
  duplicateTitles: dup(byTitle),
  duplicateDescriptions: dup(byDesc),
  duplicateCanonicals: dup(byCanonical),
  missingTitles,
  missingDescriptions,
  missingCanonicals,
  invalidCanonicalOrigins,
  parameterizedCanonicals,
  canonicalPathMismatches,
  canonicalSlashMismatches,
}

fs.mkdirSync('public/data/reports', { recursive: true })
fs.writeFileSync('public/data/reports/metadata-audit-report.json', JSON.stringify(report, null, 2))

if (
  report.duplicateCanonicals.length ||
  report.duplicateTitles.length ||
  report.duplicateDescriptions.length ||
  missingTitles.length ||
  missingDescriptions.length ||
  missingCanonicals.length ||
  invalidCanonicalOrigins.length ||
  parameterizedCanonicals.length ||
  canonicalPathMismatches.length ||
  canonicalSlashMismatches.length
) {
  // "severe metadata or canonical issues found" was the entire output, which is
  // unactionable: it names no route, and the report it writes is easy to miss.
  // A failing gate that will not say what failed gets worked around, not fixed.
  console.error('[metadata-audit] metadata or canonical issues found:\n')
  const sections = [
    ['duplicate titles', report.duplicateTitles.map((d) => `"${d.value}" on ${d.routes.join(', ')}`)],
    ['duplicate descriptions', report.duplicateDescriptions.map((d) => `${d.routes.join(', ')}`)],
    ['duplicate canonicals', report.duplicateCanonicals.map((d) => `${d.value} on ${d.routes.join(', ')}`)],
    ['missing titles', missingTitles],
    ['missing descriptions', missingDescriptions],
    ['missing canonicals', missingCanonicals],
    ['invalid canonical origins', invalidCanonicalOrigins.map((e) => `${e.route} -> ${e.canonical}`)],
    ['parameterized canonicals', parameterizedCanonicals.map((e) => `${e.route} -> ${e.canonical}`)],
    ['canonical path mismatches', canonicalPathMismatches.map((e) => `${e.route} -> ${e.canonical}`)],
    ['canonical slash mismatches', canonicalSlashMismatches.map((e) => `${e.route} -> ${e.canonical}`)],
  ]
  for (const [label, entries] of sections) {
    if (!entries.length) continue
    console.error(`  ${label}: ${entries.length}`)
    for (const entry of entries.slice(0, 10)) console.error(`    ${entry}`)
    if (entries.length > 10) console.error(`    ... and ${entries.length - 10} more`)
  }
  console.error('\n  Full report: public/data/reports/metadata-audit-report.json')
  process.exit(1)
}

console.log('[metadata-audit] completed — no duplicate or missing metadata')
