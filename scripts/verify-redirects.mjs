import fs from 'node:fs'
import path from 'node:path'

const staticDir = process.env.STATIC_OUTPUT_DIR || 'out'
const redirectsPath = path.resolve(staticDir, '_redirects')
if (!fs.existsSync(redirectsPath)) {
  console.error(`[verify-redirects] MISSING ${staticDir}/_redirects — Cloudflare Pages redirects will not be published.`)
  process.exit(1)
}

const txt = fs.readFileSync(redirectsPath, 'utf-8')
const lines = txt
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))

const requiredRedirects = [
  '/atom.xml /feed.xml 301',
  '/natural-anxiolytics-beyond-ashwagandha /guides/natural-anxiolytics-beyond-ashwagandha/ 301',
  '/psychedelic-adjacent-herbs /guides/psychedelic-adjacent-herbs/ 301',
  '/sleep-herbs-vs-melatonin /guides/sleep-herbs-vs-melatonin/ 301',
  '/compounds/coq10 /compounds/coenzyme-q10/ 301',
  '/compounds/coenzyme-q10-ubiquinol /compounds/coenzyme-q10/ 301',
  '/compounds/theanine /compounds/l-theanine/ 301',
  '/compounds/l-theanine-sleep /compounds/l-theanine/ 301',
  '/compounds/methyleugenol /compounds/methyl-eugenol/ 301',
  '/compounds/bcaas /compounds/bcaa/ 301',
  '/compounds/green-tea-egcg-isolated /compounds/green-tea-extract/ 301',
  '/compounds/green-tea-extract-egcg /compounds/green-tea-extract/ 301',
  '/compounds/probiotic-multistrain /compounds/probiotics/ 301',
  '/compounds/probiotic-strain-bifidobacterium /compounds/probiotics/ 301',
  '/compounds/probiotic-strain-lactobacillus /compounds/probiotics/ 301',
  '/compounds/probiotics-bifidobacterium /compounds/probiotics/ 301',
  '/compounds/probiotics-lactobacillus /compounds/probiotics/ 301',
  '/compounds/taurine-blend /compounds/taurine/ 301',
  '/compounds/taurine-sleep /compounds/taurine/ 301',
  '/compounds/glycine-sleep /compounds/glycine/ 301',
  '/compounds/inositol-sleep /compounds/inositol/ 301',
  '/compounds/ashwagandha-extract-ksm-66 /herbs/ashwagandha/ 301',
  '/compounds/ashwagandha-root-extract /herbs/ashwagandha/ 301',
  '/compounds/garlic /herbs/garlic/ 301',
  '/compounds/garlic-extract /herbs/garlic/ 301',
  '/compounds/garlic-aged-extract /herbs/garlic/ 301',
  '/compounds/aged-garlic-extract /herbs/garlic/ 301',
  '/herbs/allium-sativum /herbs/garlic/ 301',
  '/compounds/ginger /herbs/ginger/ 301',
  '/compounds/gingerol /herbs/ginger/ 301',
  '/compounds/gingerols /herbs/ginger/ 301',
  '/compounds/valerian /herbs/valerian/ 301',
  '/compounds/valerian-extract-standardized /herbs/valerian/ 301',
  '/compounds/valerian-root-extract /herbs/valerian/ 301',
  '/herbs/valeriana-officinalis /herbs/valerian/ 301',
  '/compounds/lions-mane /herbs/lions-mane/ 301',
  '/herbs/hericium-erinaceus /herbs/lions-mane/ 301',
  '/compounds/passionflower /herbs/passionflower/ 301',
  '/compounds/passionflower-extract /herbs/passionflower/ 301',
  '/compounds/passionflower-extract-standardized /herbs/passionflower/ 301',
  '/herbs/passiflora-incarnata /herbs/passionflower/ 301',
  '/compounds/kava /herbs/kava/ 301',
  '/compounds/kavalactones /herbs/kava/ 301',
  '/herbs/piper-methysticum /herbs/kava/ 301',
  '/compounds/reishi /herbs/reishi/ 301',
  '/herbs/ganoderma-lucidum /herbs/reishi/ 301',
  '/compounds/maca /herbs/maca/ 301',
  '/compounds/maca-root-extract /herbs/maca/ 301',
  '/compounds/elderberry /herbs/elderberry/ 301',
  '/compounds/resveratrol /herbs/resveratrol/ 301',
  '/compounds/trans-resveratrol /herbs/resveratrol/ 301',
  '/herbs/ashwagandha-withania-somnifera /herbs/ashwagandha/ 301',
  '/herbs/ashwagandha-withania-somnifera/ /herbs/ashwagandha/ 301',
  '/safety-checker /safety-checker/ 301',
  '/safety /safety-checker/ 301',
  '/safety/ /safety-checker/ 301',
]

console.log(`[verify-redirects] ${staticDir}/_redirects present with ${lines.length} active rules`)

const obsoleteAppShellRewrite = ['/*', '/index.html', '200'].join(' ')
if (lines.includes(obsoleteAppShellRewrite)) {
  console.error(`[verify-redirects] Obsolete app-shell rewrite found: "${obsoleteAppShellRewrite}"`)
  process.exit(1)
}

const atomRedirectRule = '/atom.xml /feed.xml 301'
if (!lines.includes(atomRedirectRule)) {
  console.error(`[verify-redirects] Expected feed compatibility redirect "${atomRedirectRule}"`)
  process.exit(1)
}

const minimumRedirectCount = 80
if (lines.length < minimumRedirectCount) {
  console.error(`[verify-redirects] Expected at least ${minimumRedirectCount} Cloudflare redirect rules, found ${lines.length}`)
  process.exit(1)
}

const missingRequiredRedirects = requiredRedirects.filter(rule => !lines.includes(rule))
if (missingRequiredRedirects.length) {
  console.error(`[verify-redirects] Missing required Cloudflare redirect rules:\n${missingRequiredRedirects.join('\n')}`)
  process.exit(1)
}

console.log(`[verify-redirects] OK: ${requiredRedirects.length} required rules verified`)
