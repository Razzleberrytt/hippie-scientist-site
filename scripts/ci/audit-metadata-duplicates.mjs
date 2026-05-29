import fs from 'node:fs'
const manifestPath = 'public/data/runtime-manifests/route-manifest.json'
const routes = JSON.parse(fs.readFileSync(manifestPath,'utf8'))
const byTitle = new Map(), byDesc = new Map(), byCanonical = new Map()
for (const r of routes) {
  const title = (r.meta_title||'').trim(); const desc=(r.meta_description||'').trim(); const canonical=(r.canonical_url||r.url||'').trim()
  if (title) byTitle.set(title, [...(byTitle.get(title)||[]), r.route||r.path])
  if (desc) byDesc.set(desc, [...(byDesc.get(desc)||[]), r.route||r.path])
  if (canonical) byCanonical.set(canonical, [...(byCanonical.get(canonical)||[]), r.route||r.path])
}
const dup = (m)=>[...m.entries()].filter(([,v])=>v.length>1).map(([k,v])=>({value:k,routes:v}))
const sample = (duplicates, limit = 5) => duplicates.slice(0, limit).map(({ value, routes }) => ({ value, routes: routes.slice(0, 5) }))
const duplicateTitles = dup(byTitle)
const duplicateDescriptions = dup(byDesc)
const duplicateCanonicals = dup(byCanonical)
const report={
  generatedAt:new Date().toISOString(),
  duplicateTitles,
  duplicateDescriptions,
  duplicateCanonicals,
  summary: {
    duplicateTitleCount: duplicateTitles.length,
    duplicateDescriptionCount: duplicateDescriptions.length,
    duplicateCanonicalCount: duplicateCanonicals.length,
    duplicateDescriptionSample: sample(duplicateDescriptions),
  },
}
fs.mkdirSync('public/data/reports',{recursive:true})
fs.writeFileSync('public/data/reports/metadata-audit-report.json', JSON.stringify(report,null,2))
// Grace threshold: allows up to DUPLICATE_TITLE_BLOCK_THRESHOLD duplicate titles
// before failing the build. Reduce toward 0 as workbook data quality improves.
const DUPLICATE_TITLE_BLOCK_THRESHOLD = 10
if (report.duplicateCanonicals.length || report.duplicateTitles.length>DUPLICATE_TITLE_BLOCK_THRESHOLD) { console.error('[metadata-audit] severe collisions found'); process.exit(1)}
if (report.duplicateTitles.length || report.duplicateDescriptions.length) console.warn('[metadata-audit] warnings found')
if (report.duplicateDescriptions.length) {
  console.warn(`[metadata-audit] duplicate descriptions: ${report.duplicateDescriptions.length}`)
  console.warn('[metadata-audit] duplicate description sample:', JSON.stringify(report.summary.duplicateDescriptionSample))
}
console.log('[metadata-audit] completed')
