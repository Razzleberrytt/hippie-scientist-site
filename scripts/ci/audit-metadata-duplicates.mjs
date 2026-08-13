import fs from 'node:fs'
const manifestPath = 'public/data/runtime-manifests/route-manifest.json'
const routes = JSON.parse(fs.readFileSync(manifestPath,'utf8'))
const redirectSources = new Set(
  fs.readFileSync('public/_redirects', 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split(/\s+/)[0])
    .filter(source => source.startsWith('/') && !source.includes('*'))
    .map(source => source.length > 1 ? source.replace(/\/+$/, '') : source),
)
const byTitle = new Map(), byDesc = new Map(), byCanonical = new Map()\nconst missingTitles = [], missingDescriptions = [], missingCanonicals = [], invalidCanonicalOrigins = [], parameterizedCanonicals = [], canonicalPathMismatches = [], canonicalSlashMismatches = []
for (const r of routes) {
  const routePath = r.route || r.path || ''
  const normalizedRoute = routePath.length > 1 ? routePath.replace(/\/+$/, '') : routePath
  if (redirectSources.has(normalizedRoute)) continue

  const title = (r.meta_title||'').trim(); const desc=(r.meta_description||'').trim(); const canonical=(r.canonical_url||r.url||'').trim()
  if (title) byTitle.set(title, [...(byTitle.get(title)||[]), routePath]); else missingTitles.push(routePath)
  if (desc) byDesc.set(desc, [...(byDesc.get(desc)||[]), routePath]); else missingDescriptions.push(routePath)
  if (canonical) {\n    byCanonical.set(canonical, [...(byCanonical.get(canonical)||[]), routePath])\n    try {\n      const canonicalUrl = new URL(canonical)\n      if (canonicalUrl.origin !== 'https://thehippiescientist.net') invalidCanonicalOrigins.push({ route: routePath, canonical })\n      if (canonicalUrl.search || canonicalUrl.hash) parameterizedCanonicals.push({ route: routePath, canonical })\n      const canonicalPath = canonicalUrl.pathname.length > 1 ? canonicalUrl.pathname.replace(/\\/+$/, '') : canonicalUrl.pathname\n      if (canonicalPath !== normalizedRoute) canonicalPathMismatches.push({ route: routePath, canonical })\n      if (canonicalUrl.pathname !== '/' && !canonicalUrl.pathname.endsWith('/')) canonicalSlashMismatches.push({ route: routePath, canonical })\n    }\n    catch { invalidCanonicalOrigins.push({ route: routePath, canonical }) }\n  } else missingCanonicals.push(routePath)
}
const dup = (m)=>[...m.entries()].filter(([,v])=>v.length>1).map(([k,v])=>({value:k,routes:v}))
const report={generatedAt:new Date().toISOString(), duplicateTitles:dup(byTitle), duplicateDescriptions:dup(byDesc), duplicateCanonicals:dup(byCanonical), missingTitles, missingDescriptions, missingCanonicals, invalidCanonicalOrigins, parameterizedCanonicals, canonicalPathMismatches, canonicalSlashMismatches}
fs.mkdirSync('public/data/reports',{recursive:true})
fs.writeFileSync('public/data/reports/metadata-audit-report.json', JSON.stringify(report,null,2))
if (report.duplicateCanonicals.length || report.duplicateTitles.length > 0 || report.duplicateDescriptions.length > 0 || missingTitles.length || missingDescriptions.length || missingCanonicals.length || invalidCanonicalOrigins.length || parameterizedCanonicals.length || canonicalPathMismatches.length || canonicalSlashMismatches.length) { console.error('[metadata-audit] severe collisions found: unique descriptions assert failed'); process.exit(1)}
if (report.duplicateTitles.length) console.warn('[metadata-audit] warnings found')
console.log('[metadata-audit] completed')
