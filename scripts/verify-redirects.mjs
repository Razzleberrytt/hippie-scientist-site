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

// Targets are the routes that actually build. The three legacy guide aliases
// below used to expect /guides/<slug>/, which app/guides/[slug] does not
// generate, so the assertion was passing while the redirect served a 404.
const requiredRedirects = [
  '/atom.xml /feed.xml 301',
  '/natural-anxiolytics-beyond-ashwagandha /guides/anxiety/natural-anxiolytics-beyond-ashwagandha/ 301',
  '/psychedelic-adjacent-herbs /guides/other/psychedelic-adjacent-herbs/ 301',
  '/sleep-herbs-vs-melatonin /guides/sleep/sleep-herbs-vs-melatonin/ 301',
  '/compounds/coq10 /compounds/coenzyme-q10/ 301',
  '/compounds/coenzyme-q10-ubiquinol /compounds/coenzyme-q10/ 301',
  '/compounds/theanine /compounds/l-theanine/ 301',
  '/compounds/l-theanine-sleep /compounds/l-theanine/ 301',
  '/compounds/methyleugenol /compounds/methyl-eugenol/ 301',
  '/compounds/bcaas /compounds/bcaa/ 301',
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

const malformedTargetRules = lines.filter((line) => {
  const [, target = ''] = line.split(/\s+/)
  if (!target) return true
  return !target.startsWith('/') && !/^https?:\/\//i.test(target)
})

if (malformedTargetRules.length) {
  console.warn(`[verify-redirects] Warning: ${malformedTargetRules.length} redirect rules have malformed-looking targets:`)
  for (const rule of malformedTargetRules.slice(0, 20)) {
    console.warn(`[verify-redirects]   ${rule}`)
  }
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

// Every redirect target must resolve to a page that was actually exported.
// Three required rules previously pointed at /guides/<slug>/ routes that
// app/guides/[slug] does not build, so the redirect resolved to a 404 — a
// redirect into a dead end is worse than no redirect, because search engines
// keep the source URL in the index while it earns nothing.
const targetsMissingPages = []
for (const line of lines) {
  const [source, target = ''] = line.split(/\s+/)
  if (source.includes('*') || target.includes(':splat')) continue

  let pathname = target
  if (/^https?:\/\//i.test(target)) {
    try {
      const url = new URL(target)
      // Off-site targets are outside this repo's control.
      if (!/(^|\.)thehippiescientist\.net$/i.test(url.hostname)) continue
      pathname = url.pathname
    } catch {
      continue
    }
  }
  if (!pathname.startsWith('/')) continue

  const relative = pathname.replace(/^\/+/, '').replace(/\/+$/, '')
  const candidates = relative
    ? [path.join(staticDir, relative, 'index.html'), path.join(staticDir, relative)]
    : [path.join(staticDir, 'index.html')]

  if (!candidates.some((candidate) => fs.existsSync(candidate))) {
    targetsMissingPages.push(`${source} -> ${target}`)
  }
}

if (targetsMissingPages.length) {
  console.error(
    `[verify-redirects] ${targetsMissingPages.length} redirect target(s) do not exist in ${staticDir}/:`,
  )
  for (const rule of targetsMissingPages.slice(0, 25)) {
    console.error(`[verify-redirects]   ${rule}`)
  }
  process.exit(1)
}

// A URL cannot be both advertised as canonical in the sitemap and redirected
// away. This happens when a redirect is added to paper over a 404 and the page
// is built later: `public/redirect-overrides/*` rules are *prepended* to
// out/_redirects, so they win over everything and silently orphan the new page.
const sitemapPath = path.join(staticDir, 'sitemap.xml')
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8')
  const sitemapPaths = new Set(
    [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
      try {
        return new URL(match[1].trim()).pathname.replace(/\/+$/, '') || '/'
      } catch {
        return ''
      }
    }),
  )

  const shadowed = []
  for (const line of lines) {
    const [source, target = ''] = line.split(/\s+/)
    if (source.includes('*') || !source.startsWith('/')) continue

    const normalized = source.replace(/\/+$/, '') || '/'
    if (!sitemapPaths.has(normalized)) continue

    // A rule that only adds the trailing slash is the canonicalization itself
    // (`/safety-checker -> /safety-checker/`), not a redirect away from the page.
    let targetPath = target
    if (/^https?:\/\//i.test(target)) {
      try {
        targetPath = new URL(target).pathname
      } catch {
        targetPath = target
      }
    }
    if ((targetPath.replace(/\/+$/, '') || '/') === normalized) continue

    shadowed.push(line)
  }

  if (shadowed.length) {
    console.error(
      `[verify-redirects] ${shadowed.length} sitemap URL(s) are also redirect sources — they would 301 away from a page listed as canonical:`,
    )
    for (const rule of shadowed.slice(0, 25)) {
      console.error(`[verify-redirects]   ${rule}`)
    }
    process.exit(1)
  }
}

console.log(`[verify-redirects] OK: ${requiredRedirects.length} required rules verified`)
console.log(`[verify-redirects] OK: all ${lines.length} redirect targets resolve to exported pages`)
console.log('[verify-redirects] OK: no sitemap URL is shadowed by a redirect')
