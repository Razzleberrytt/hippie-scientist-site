// relaxed MVP validation mode

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

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
