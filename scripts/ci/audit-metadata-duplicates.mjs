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
const byTitle = new Map(), byDesc = new Map(), byCanonical = new Map()
for (const r of routes) {
  const routePath = r.route || r.path || ''
  const normalizedRoute = routePath.length > 1 ? routePath.replace(/\/+$/, '') : routePath
  if (redirectSources.has(normalizedRoute)) continue

  const title = (r.meta_title||'').trim(); const desc=(r.meta_description||'').trim(); const canonical=(r.canonical_url||r.url||'').trim()
  if (title) byTitle.set(title, [...(byTitle.get(title)||[]), routePath])
  if (desc) byDesc.set(desc, [...(byDesc.get(desc)||[]), routePath])
  if (canonical) byCanonical.set(canonical, [...(byCanonical.get(canonical)||[]), routePath])
}
const dup = (m)=>[...m.entries()].filter(([,v])=>v.length>1).map(([k,v])=>({value:k,routes:v}))
const report={generatedAt:new Date().toISOString(), duplicateTitles:dup(byTitle), duplicateDescriptions:dup(byDesc), duplicateCanonicals:dup(byCanonical)}
fs.mkdirSync('public/data/reports',{recursive:true})
fs.writeFileSync('public/data/reports/metadata-audit-report.json', JSON.stringify(report,null,2))
if (report.duplicateCanonicals.length || report.duplicateTitles.length>10 || report.duplicateDescriptions.length > 0) { console.error('[metadata-audit] severe collisions found: unique descriptions assert failed'); process.exit(1)}
if (report.duplicateTitles.length) console.warn('[metadata-audit] warnings found')
console.log('[metadata-audit] completed')
