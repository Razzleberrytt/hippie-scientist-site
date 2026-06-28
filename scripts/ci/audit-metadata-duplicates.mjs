import fs from 'node:fs'
const manifestPath = 'public/data/runtime-manifests/route-manifest.json'
const routes = JSON.parse(fs.readFileSync(manifestPath,'utf8'))
const SITE_ORIGIN = 'https://thehippiescientist.net'
const deprecatedSlugs = new Set([
  'coq10', 'coenzyme-q10-ubiquinol', 'theanine', 'l-theanine-sleep', 'methyleugenol', 'methyl-eugenol', 'bcaas',
  'green-tea-egcg-isolated', 'green-tea-extract-egcg', 'probiotic-multistrain', 'probiotic-strain-bifidobacterium',
  'probiotic-strain-lactobacillus', 'probiotics-bifidobacterium', 'probiotics-lactobacillus', 'taurine-blend',
  'taurine-sleep', 'glycine-sleep', 'inositol-sleep', 'ashwagandha-extract-ksm-66', 'ashwagandha-root-extract',
  'garlic', 'garlic-extract', 'garlic-aged-extract', 'aged-garlic-extract', 'ginger', 'gingerol', 'gingerols',
  'valerian', 'valerian-extract-standardized', 'valerian-root-extract', 'lions-mane', 'passionflower',
  'passionflower-extract', 'passionflower-extract-standardized', 'kava', 'kavalactones', 'reishi', 'maca',
  'maca-root-extract', 'elderberry', 'resveratrol', 'trans-resveratrol', 'glycyrrhizin-isolated',
  'allium-sativum', 'valeriana-officinalis', 'hericium-erinaceus', 'passiflora-incarnata', 'piper-methysticum', 'ganoderma-lucidum',
  'berberis-vulgaris', 'berberis-aristata', 'coptis-chinensis', 'boswellia-carterii', 'morus-alba', 'phellodendron',
  'astragalus-membranaceus', 'atractylodes-macrocephala', 'angelica-sinensis', 'angelica-root',
  'ashwagandha-withania-somnifera', 'withania-somnifera', 'silybum-marianum',
  'nr', 'berberine-hcl',
  '7-hydroxymitragynine', 'mitragynine', 'kratom', 'phosphatidylserine', 'curcumin', 'l-glutamine',
  'ashwagandha-vs-rhodiola-for-stress', 'magnesium-glycinate-vs-l-threonate-for-sleep',
  'iron-ferritin-and-adhd', 'vitamin-d-and-adhd', 'zinc-and-adhd', 'magnesium-for-adhd', 'omega-3-and-adhd',
  'start', 'build'
])

const redirectOnlyRoutes = new Set([
  '/(public)/build',
  '/build',
  '/404',
  '/500',
  '/education/explorer',
  '/stacks/builder',
  '/start',
  '/compare/ashwagandha-vs-rhodiola-for-stress',
  '/compare/magnesium-glycinate-vs-l-threonate-for-sleep',
  '/compounds/7-hydroxymitragynine',
  '/compounds/mitragynine',
  '/compounds/kratom',
  '/compounds/phosphatidylserine',
  '/compounds/curcumin',
  '/compounds/l-glutamine',
  '/focus-cluster/iron-ferritin-and-adhd',
  '/focus-cluster/vitamin-d-and-adhd',
  '/focus-cluster/zinc-and-adhd',
  '/focus-cluster/magnesium-for-adhd',
  '/focus-cluster/omega-3-and-adhd',
  '/herbs/allium-sativum',
  '/herbs/valeriana-officinalis',
  '/herbs/hericium-erinaceus',
  '/herbs/passiflora-incarnata',
  '/herbs/piper-methysticum',
  '/herbs/ganoderma-lucidum',
  '/herbs/berberis-vulgaris',
  '/herbs/berberis-aristata',
  '/herbs/coptis-chinensis',
  '/herbs/boswellia-carterii',
  '/herbs/morus-alba',
  '/herbs/phellodendron',
  '/herbs/astragalus-membranaceus',
  '/herbs/atractylodes-macrocephala',
  '/herbs/angelica-sinensis',
  '/herbs/angelica-root'
])

const exemptRoutePrefixes = [
  '/blog/',
  '/compounds/page/',
  '/herbs/page/',
  '/start/'
]

function normalizeRoutePath(routePath) {
  if (!routePath) return ''
  const normalized = `/${String(routePath).trim()}`
    .replace(/\/+/g, '/')
    .replace(/\/index$/, '')
    .replace(/\/$/, '')
  return normalized || '/'
}

function normalizeCanonicalPath(canonical) {
  if (!canonical) return ''
  try {
    const url = new URL(String(canonical), SITE_ORIGIN)
    return normalizeRoutePath(url.pathname)
  } catch {
    return normalizeRoutePath(String(canonical).replace(SITE_ORIGIN, ''))
  }
}

function getSlug(routePath) {
  const normalized = normalizeRoutePath(routePath)
  const segments = normalized.split('/').filter(Boolean)
  return segments[segments.length - 1] || ''
}

function includesDeprecatedSlug(routePath) {
  const normalized = normalizeRoutePath(routePath)
  return [...deprecatedSlugs].some(slug => normalized.includes(slug))
}

function isSelfCanonicalRoute(routePath, canonical) {
  if (!canonical) return true
  return normalizeCanonicalPath(canonical) === normalizeRoutePath(routePath)
}

function isExemptRoute(routePath) {
  const normalized = normalizeRoutePath(routePath)
  const slug = getSlug(normalized)
  if (deprecatedSlugs.has(slug)) return true
  if (includesDeprecatedSlug(normalized)) return true
  if (redirectOnlyRoutes.has(normalized)) return true
  if (normalized.includes('(') || normalized.includes(')')) return true
  if (exemptRoutePrefixes.some(prefix => normalized.startsWith(prefix))) return true
  return false
}

const byTitle = new Map(), byDesc = new Map(), byCanonical = new Map()
for (const r of routes) {
  const routePath = normalizeRoutePath(r.route || r.path || '')
  const canonical=(r.canonical_url||r.url||'').trim()
  if (isExemptRoute(routePath)) continue
  if (!isSelfCanonicalRoute(routePath, canonical)) continue

  const title = (r.meta_title||'').trim(); const desc=(r.meta_description||'').trim()
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