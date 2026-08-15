// relaxed MVP validation mode

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CANONICAL_ORIGIN = 'https://thehippiescientist.net'

function warn(msg) {
  console.warn(`[deploy-readiness] WARN ${msg}`)
}

function readJsonSafe(p) {
  try {
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

function validateGeneratedSitemap() {
  const outDir = path.join(ROOT, 'out')
  const sitemapPath = path.join(outDir, 'sitemap.xml')

  if (!fs.existsSync(outDir)) {
    warn('out directory missing; generated sitemap check skipped before build output exists')
    return
  }

  if (!fs.existsSync(sitemapPath)) {
    console.error('[deploy-readiness] out/sitemap.xml missing')
    process.exit(1)
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8').trim()
  if (!sitemap || !sitemap.includes('<urlset')) {
    console.error('[deploy-readiness] out/sitemap.xml is empty or not a valid sitemap urlset')
    process.exit(1)
  }
}

function normalizeRoutePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return `/${pathname.replace(/^\/+|\/+$/g, '')}/`
}

function routeToHtmlPath(outDir, pathname) {
  const normalized = normalizeRoutePath(pathname)
  if (normalized === '/') return path.join(outDir, 'index.html')
  return path.join(outDir, normalized.replace(/^\/+|\/+$/g, ''), 'index.html')
}

function renderedRobotsNoindex(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  return tags.some((tag) =>
    /\bname\s*=\s*["'](?:robots|googlebot)["']/i.test(tag) &&
    /\bcontent\s*=\s*["'][^"']*\bnoindex\b[^"']*["']/i.test(tag),
  )
}

function renderedCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || []
  const canonicalTag = tags.find((tag) => /\brel\s*=\s*["']canonical["']/i.test(tag))
  return canonicalTag?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() || null
}

function exactRedirectSources(outDir) {
  const redirectsPath = path.join(outDir, '_redirects')
  const sources = new Set()
  if (!fs.existsSync(redirectsPath)) return sources

  for (const line of fs.readFileSync(redirectsPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [source, target, status] = trimmed.split(/\s+/)
    if (!source || !target || !/^30[1278]$/.test(status || '') || source.includes('*')) continue
    const sourcePath = normalizeRoutePath(source.split(/[?#]/)[0])
    const targetPath = normalizeRoutePath(target.split(/[?#]/)[0])
    if (sourcePath !== targetPath) sources.add(sourcePath)
  }

  return sources
}

function validateLlmsCitationTargets() {
  const outDir = path.join(ROOT, 'out')
  if (!fs.existsSync(outDir)) return

  const llmsPath = path.join(outDir, 'llms.txt')
  if (!fs.existsSync(llmsPath)) {
    console.error('[deploy-readiness] out/llms.txt missing')
    process.exit(1)
  }

  const text = fs.readFileSync(llmsPath, 'utf8')
  const urls = [...new Set(text.match(/https:\/\/thehippiescientist\.net\/[^\s)\]}>"']*/g) || [])]
  const redirectSources = exactRedirectSources(outDir)
  const failures = []
  let checkedHtmlTargets = 0

  for (const rawUrl of urls) {
    let url
    try {
      url = new URL(rawUrl)
    } catch {
      failures.push(`invalid URL: ${rawUrl}`)
      continue
    }

    if (url.origin !== CANONICAL_ORIGIN) {
      failures.push(`non-canonical origin: ${rawUrl}`)
      continue
    }

    // llms.txt also advertises machine resources such as sitemap.xml,
    // robots.txt, and JSON-LD artifacts. The checks below are specifically for
    // user-facing citation targets that should resolve to canonical HTML pages.
    if (/\.(?:xml|txt|json)$/i.test(url.pathname)) continue

    checkedHtmlTargets++
    const routePath = normalizeRoutePath(url.pathname)
    const htmlPath = routeToHtmlPath(outDir, routePath)

    if (redirectSources.has(routePath)) {
      failures.push(`redirect source advertised as citation target: ${rawUrl}`)
      continue
    }

    if (!fs.existsSync(htmlPath)) {
      failures.push(`missing built HTML target: ${rawUrl}`)
      continue
    }

    const html = fs.readFileSync(htmlPath, 'utf8')
    if (renderedRobotsNoindex(html)) {
      failures.push(`noindex HTML target: ${rawUrl}`)
    }

    const canonical = renderedCanonical(html)
    if (!canonical) {
      failures.push(`missing canonical on HTML target: ${rawUrl}`)
      continue
    }

    let canonicalUrl
    try {
      canonicalUrl = new URL(canonical, CANONICAL_ORIGIN)
    } catch {
      failures.push(`invalid rendered canonical for ${rawUrl}: ${canonical}`)
      continue
    }

    const expected = `${CANONICAL_ORIGIN}${routePath}`
    if (canonicalUrl.href !== expected) {
      failures.push(`canonical mismatch for ${rawUrl}: ${canonicalUrl.href}`)
    }
  }

  if (failures.length > 0) {
    console.error(`[deploy-readiness] llms.txt citation-target validation failed (${failures.length} issue(s)):`)
    failures.forEach((failure) => console.error(`  - ${failure}`))
    process.exit(1)
  }

  console.log(`[deploy-readiness] llms.txt citation targets valid (${checkedHtmlTargets} canonical HTML targets checked)`)
}

function main() {
  const herbs = readJsonSafe(path.join(ROOT, 'public/data/herbs.json'))
  const compounds = readJsonSafe(path.join(ROOT, 'public/data/compounds.json'))

  if (!Array.isArray(herbs) || herbs.length === 0) {
    console.error('[deploy-readiness] herbs.json missing or empty')
    process.exit(1)
  }

  if (!Array.isArray(compounds) || compounds.length === 0) {
    console.error('[deploy-readiness] compounds.json missing or empty')
    process.exit(1)
  }

  validateGeneratedSitemap()
  validateLlmsCitationTargets()

  const outDir = path.join(ROOT, 'out')
  if (fs.existsSync(outDir)) {
    const herbsDir = path.join(outDir, 'herbs')
    if (!fs.existsSync(herbsDir)) {
      console.error('DEPLOY BLOCKED: out/herbs/ directory does not exist.')
      process.exit(1)
    }
    const files = fs.readdirSync(herbsDir)
    const directories = files.filter(f => {
      try {
        const stats = fs.statSync(path.join(herbsDir, f))
        return stats.isDirectory() && f !== 'page'
      } catch {
        return false
      }
    })
    if (directories.length < 270) {
      console.error(`DEPLOY BLOCKED: out/herbs/ contains fewer than 270 herb profile directories. Static generation of herb profiles has failed. Check generateStaticParams() in app/herbs/[slug]/page.tsx. Found: ${directories.length}`)
      process.exit(1)
    }
  }

  if (!fs.existsSync(path.join(ROOT, 'public/data/herbs-detail'))) {
    warn('herbs-detail missing (allowed in MVP)')
  }

  if (!fs.existsSync(path.join(ROOT, 'public/data/compounds-detail'))) {
    warn('compounds-detail missing (allowed in MVP)')
  }

  console.log('[deploy-readiness] PASS (MVP relaxed mode)')
}

main()
