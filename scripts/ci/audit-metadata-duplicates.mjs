import fs from 'node:fs'
const manifestPath = 'public/data/runtime-manifests/route-manifest.json'
const routes = JSON.parse(fs.readFileSync(manifestPath,'utf8'))
const deprecatedSlugs = new Set([
  'coq10', 'coenzyme-q10-ubiquinol', 'theanine', 'l-theanine-sleep', 'methyleugenol', 'bcaas',
  'green-tea-egcg-isolated', 'green-tea-extract-egcg', 'probiotic-multistrain', 'probiotic-strain-bifidobacterium',
  'probiotic-strain-lactobacillus', 'probiotics-bifidobacterium', 'probiotics-lactobacillus', 'taurine-blend',
  'taurine-sleep', 'glycine-sleep', 'inositol-sleep', 'ashwagandha-extract-ksm-66', 'ashwagandha-root-extract',
  'garlic', 'garlic-extract', 'garlic-aged-extract', 'aged-garlic-extract', 'ginger', 'gingerol', 'gingerols',
  'valerian', 'valerian-extract-standardized', 'valerian-root-extract', 'lions-mane', 'passionflower',
  'passionflower-extract', 'passionflower-extract-standardized', 'kava', 'kavalactones', 'reishi', 'maca',
  'maca-root-extract', 'elderberry', 'resveratrol', 'trans-resveratrol',
  'allium-sativum', 'valeriana-officinalis', 'hericium-erinaceus', 'passiflora-incarnata', 'piper-methysticum', 'ganoderma-lucidum',
  'nr', 'berberine-hcl'
])
const byTitle = new Map(), byDesc = new Map(), byCanonical = new Map()
for (const r of routes) {
  const routePath = r.route || r.path || ''
  const slug = routePath.split('/').pop()
  if (deprecatedSlugs.has(slug)) continue

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
