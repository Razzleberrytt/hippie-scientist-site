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
  '/natural-anxiolytics-beyond-ashwagandha /guides/natural-anxiolytics-beyond-ashwagandha 308',
  '/psychedelic-adjacent-herbs /guides/psychedelic-adjacent-herbs 308',
  '/sleep-herbs-vs-melatonin /guides/sleep-herbs-vs-melatonin 308',
  '/compounds/coq10 /compounds/coenzyme-q10 308',
  '/compounds/coenzyme-q10-ubiquinol /compounds/coenzyme-q10 308',
  '/compounds/theanine /compounds/l-theanine 308',
  '/compounds/l-theanine-sleep /compounds/l-theanine 308',
  '/compounds/methyleugenol /compounds/methyl-eugenol 308',
  '/compounds/bcaas /compounds/bcaa 308',
  '/compounds/green-tea-egcg-isolated /compounds/green-tea-extract 308',
  '/compounds/green-tea-extract-egcg /compounds/green-tea-extract 308',
  '/compounds/probiotic-multistrain /compounds/probiotics 308',
  '/compounds/probiotic-strain-bifidobacterium /compounds/probiotics 308',
  '/compounds/probiotic-strain-lactobacillus /compounds/probiotics 308',
  '/compounds/probiotics-bifidobacterium /compounds/probiotics 308',
  '/compounds/probiotics-lactobacillus /compounds/probiotics 308',
  '/compounds/taurine-blend /compounds/taurine 308',
  '/compounds/taurine-sleep /compounds/taurine 308',
  '/compounds/glycine-sleep /compounds/glycine 308',
  '/compounds/inositol-sleep /compounds/inositol 308',
  '/compounds/ashwagandha-extract-ksm-66 /herbs/ashwagandha 308',
  '/compounds/ashwagandha-root-extract /herbs/ashwagandha 308',
  '/compounds/garlic /herbs/garlic 308',
  '/compounds/garlic-extract /herbs/garlic 308',
  '/compounds/garlic-aged-extract /herbs/garlic 308',
  '/compounds/aged-garlic-extract /herbs/garlic 308',
  '/herbs/allium-sativum /herbs/garlic 308',
  '/compounds/ginger /herbs/ginger 308',
  '/compounds/gingerol /herbs/ginger 308',
  '/compounds/gingerols /herbs/ginger 308',
  '/compounds/valerian /herbs/valerian 308',
  '/compounds/valerian-extract-standardized /herbs/valerian 308',
  '/compounds/valerian-root-extract /herbs/valerian 308',
  '/herbs/valeriana-officinalis /herbs/valerian 308',
  '/compounds/lions-mane /herbs/lions-mane 308',
  '/herbs/hericium-erinaceus /herbs/lions-mane 308',
  '/compounds/passionflower /herbs/passionflower 308',
  '/compounds/passionflower-extract /herbs/passionflower 308',
  '/compounds/passionflower-extract-standardized /herbs/passionflower 308',
  '/herbs/passiflora-incarnata /herbs/passionflower 308',
  '/compounds/kava /herbs/kava 308',
  '/compounds/kavalactones /herbs/kava 308',
  '/herbs/piper-methysticum /herbs/kava 308',
  '/compounds/reishi /herbs/reishi 308',
  '/herbs/ganoderma-lucidum /herbs/reishi 308',
  '/compounds/maca /herbs/maca 308',
  '/compounds/maca-root-extract /herbs/maca 308',
  '/compounds/elderberry /herbs/elderberry 308',
  '/compounds/resveratrol /herbs/resveratrol 308',
  '/compounds/trans-resveratrol /herbs/resveratrol 308',
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
