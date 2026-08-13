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

for (const r of routes) {
  const routePath = r.route || r.path || ''
  const normalizedRoute = routePath.length > 1 ? routePath.replace(/\/+$/, '') : routePath
  if (redirectSources.has(normalizedRoute)) continue

  const title = (r.meta_title || '').trim()
  const desc = (r.meta_description || '').trim()
  const canonical = (r.canonical_url || r.url || '').trim()

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
  console.error('[metadata-audit] severe metadata or canonical issues found')
  process.exit(1)
}

console.log('[metadata-audit] completed')
