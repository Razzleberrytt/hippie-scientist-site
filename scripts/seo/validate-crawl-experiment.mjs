#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizeExperimentPath, stableHash, stableStringify, validateAssignedRows } from './crawl-experiment-core.mjs'

const ROOT = process.cwd()
const MANIFEST = path.join(ROOT, 'ops', 'seo', 'crawl-experiment', 'manifest.json')
const STRUCTURE_ONLY = process.argv.includes('--structure-only')
const OUT_DIR = process.argv.find((arg) => arg.startsWith('--out-dir='))?.split('=')[1] || 'out'

async function readJsonOptional(file) { try { return JSON.parse(await fs.readFile(file, 'utf8')) } catch { return null } }
function slugFromPathname(pathname) { return pathname.split('/').filter(Boolean)[1] }

async function sourceHashFor(pathname) {
  const slug = slugFromPathname(pathname)
  const candidates = [
    ['herbs', path.join(ROOT, 'public/data/herbs.json')],
    ['herbs-summary', path.join(ROOT, 'public/data/herbs-summary.json')],
    ['summary-index', path.join(ROOT, 'public/data/summary-indexes/herbs-summary.json')],
    ['detail', path.join(ROOT, `public/data/herbs-detail/${slug}.json`)],
  ]
  const layers = {}
  for (const [name, file] of candidates) {
    const parsed = await readJsonOptional(file)
    if (Array.isArray(parsed)) {
      const match = parsed.find((row) => row && typeof row === 'object' && row.slug === slug)
      if (match) layers[name] = match
    } else if (parsed && typeof parsed === 'object' && (parsed.slug === slug || name === 'detail')) {
      layers[name] = parsed
    }
  }
  if (!Object.keys(layers).length) throw new Error(`No source data found for ${pathname}`)
  return stableHash(stableStringify(layers))
}

function htmlMeta(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  const tag = tags.find((entry) => new RegExp(`name=["']${name}["']`, 'i').test(entry))
  return tag?.match(/content=["']([^"']*)["']/i)?.[1] || ''
}

function canonicalFromHtml(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || []
  const tag = tags.find((entry) => /rel=["']canonical["']/i.test(entry))
  return tag?.match(/href=["']([^"']*)["']/i)?.[1] || ''
}

function sitemapLastmods(xml) {
  const result = new Map()
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim()?.replaceAll('&amp;', '&')
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim()
    if (loc && lastmod) {
      try { result.set(normalizeExperimentPath(loc), lastmod) } catch {}
    }
  }
  return result
}

async function main() {
  const manifest = await readJsonOptional(MANIFEST)
  if (!manifest) {
    console.log('Crawl experiment is dormant: no manifest.json. Engine/edge code remains fail-closed.')
    return
  }
  if (manifest.status !== 'active') throw new Error(`Unexpected manifest status: ${manifest.status}`)
  validateAssignedRows(manifest.rows)
  const frozen = manifest.rows.filter((row) => row.arm === 'treatment' || row.arm === 'control')
  if (frozen.length !== 40 || frozen.some((row) => !row.lastmod_block || !row.baseline_source_hash || !row.baseline_lastmod || !row.baseline_last_crawled)) {
    throw new Error('All 40 randomized pages must have complete freeze/baseline fields')
  }

  const freezeActive = Date.now() < new Date(manifest.freeze_end).valueOf()
  if (freezeActive) {
    for (const row of frozen) {
      const currentHash = await sourceHashFor(row.pathname)
      if (currentHash !== row.baseline_source_hash) throw new Error(`Experiment content freeze violated: ${row.pathname}`)
    }
  }
  if (STRUCTURE_ONLY) {
    console.log(`Crawl experiment structure valid; freeze active=${freezeActive}`)
    return
  }

  const sitemapXml = await fs.readFile(path.join(ROOT, OUT_DIR, 'sitemap.xml'), 'utf8')
  const lastmods = sitemapLastmods(sitemapXml)
  for (const row of frozen) {
    const html = await fs.readFile(path.join(ROOT, OUT_DIR, row.pathname.replace(/^\//, ''), 'index.html'), 'utf8')
    const canonical = canonicalFromHtml(html)
    const robots = htmlMeta(html, 'robots').toLowerCase()
    if (canonical !== row.baseline_canonical) throw new Error(`Canonical freeze violated for ${row.pathname}: ${canonical}`)
    if (robots.includes('noindex')) throw new Error(`Indexability freeze violated for ${row.pathname}: ${robots}`)
    const currentLastmod = lastmods.get(row.pathname)
    if (freezeActive && currentLastmod !== row.baseline_lastmod) {
      throw new Error(`lastmod changed during freeze for ${row.pathname}: ${row.baseline_lastmod} -> ${currentLastmod || '<missing>'}`)
    }
  }
  console.log(`Validated crawl experiment: 20 treatment / 20 control / 57 observational; freeze active=${freezeActive}`)
}

main().catch((error) => { console.error(error); process.exit(1) })
