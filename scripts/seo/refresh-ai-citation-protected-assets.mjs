#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  DEFAULT_AI_CITATION_PROTECTION_POLICY,
  identityFingerprint,
  normalizeUrlPath,
  outputHtmlPath,
  parseRedirectMap,
  parseRenderedPageIdentity,
  selectProtectedCitationAssets,
} from './ai-citation-protected-assets.mjs'

const ROOT = process.cwd()
const argv = process.argv.slice(2)

function flag(name, fallback) {
  const hit = argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const INPUT_DIR = path.resolve(ROOT, String(flag('dir', 'data-sources/ai-performance')))
const OUT_DIR = path.resolve(ROOT, String(flag('out-dir', 'out')))
const LEDGER_PATH = path.resolve(ROOT, String(flag('ledger', 'config/ai-citation-protected-assets.json')))
const REDIRECTS_PATH = path.resolve(ROOT, String(flag('redirects', 'public/_redirects')))
const policy = {
  minCitations: Number(flag('min-citations', DEFAULT_AI_CITATION_PROTECTION_POLICY.minCitations)),
  cumulativeCitationShare: Number(
    flag('cumulative-share', DEFAULT_AI_CITATION_PROTECTION_POLICY.cumulativeCitationShare),
  ),
  maxAssets: Number(flag('max-assets', DEFAULT_AI_CITATION_PROTECTION_POLICY.maxAssets)),
}

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (quoted) {
      if (char === '"') {
        if (content[index + 1] === '"') {
          field += '"'
          index += 1
        } else quoted = false
      } else field += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (rows[0]?.[0]) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '')
  return rows.filter((cells) => cells.some((cell) => cell.trim()))
}

function loadPageStats(file) {
  const parsed = parseCsv(fs.readFileSync(file, 'utf8'))
  if (parsed.length < 2) return null
  const header = parsed[0].map((value) => value.trim().toLowerCase())
  const pageIndex = header.findIndex((value) => ['page', 'url', 'cited url'].includes(value))
  const citationIndex = header.findIndex((value) => ['citations', 'ai citations', 'citation count'].includes(value))
  if (pageIndex < 0 || citationIndex < 0) return null
  const rows = parsed.slice(1).map((cells) => ({
    url: normalizeUrlPath(cells[pageIndex]),
    citations: Number.parseFloat(String(cells[citationIndex] ?? '').replace(/[^0-9.-]/g, '')) || 0,
  }))
  return rows.some((row) => row.citations > 0) ? rows : null
}

function latestPageStatsExport(dir) {
  if (!fs.existsSync(dir)) return null
  return fs
    .readdirSync(dir)
    .filter((name) => /\.csv$/i.test(name))
    .map((name) => ({ name, file: path.join(dir, name), stat: fs.statSync(path.join(dir, name)) }))
    .filter(({ file }) => loadPageStats(file))
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs || b.name.localeCompare(a.name))[0] ?? null
}

function snapshotLabelFrom(name) {
  const match = String(name).match(/_(\d{1,2})_(\d{1,2})_(\d{4})(?:\.[^.]+)?$/)
  if (!match) return String(flag('label', 'unknown'))
  const [, month, day, year] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function firstExisting(candidates) {
  return candidates.find((candidate) => fs.existsSync(path.join(ROOT, candidate))) ?? null
}

function resolveSourceOwnership(url) {
  const normalized = normalizeUrlPath(url)
  const route = normalized.replace(/^\//, '').replace(/\/$/, '')
  if (normalized.startsWith('/articles/')) {
    const slug = route.split('/').at(-1)
    const sourcePath = firstExisting([
      `content/articles/${slug}.md`,
      `content/articles/${slug}.mdx`,
      `content/blog/${slug}.md`,
      `content/blog/${slug}.mdx`,
    ])
    return {
      ...(sourcePath ? { sourcePath } : {}),
      routeSourcePath: 'app/articles/[slug]/page.tsx',
    }
  }

  const routeSourcePath = firstExisting([`app/${route}/page.tsx`])
  if (!routeSourcePath) return {}

  // This public compatibility route delegates its actual body to the anxiety owner.
  if (normalized === '/guides/best/supplements-for-stress/') {
    const owner = 'app/guides/anxiety/best-supplements-for-stress/page.tsx'
    return {
      routeSourcePath,
      sourcePath: fs.existsSync(path.join(ROOT, owner)) ? owner : routeSourcePath,
    }
  }

  return { sourcePath: routeSourcePath }
}

function loadExistingLedger() {
  if (!fs.existsSync(LEDGER_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'))
  } catch {
    return null
  }
}

function rounded(value) {
  return Number(Number(value).toFixed(6))
}

function main() {
  const latest = latestPageStatsExport(INPUT_DIR)
  if (!latest) {
    console.log(`[ai-citation-assets] no page-stats CSV found in ${path.relative(ROOT, INPUT_DIR)}`)
    process.exit(0)
  }

  const rows = loadPageStats(latest.file)
  const selection = selectProtectedCitationAssets(rows, policy)
  const existing = loadExistingLedger()
  const existingByUrl = new Map((existing?.assets ?? []).map((asset) => [normalizeUrlPath(asset.url), asset]))
  const redirects = fs.existsSync(REDIRECTS_PATH)
    ? parseRedirectMap(fs.readFileSync(REDIRECTS_PATH, 'utf8'))
    : new Map()

  let readyIdentities = 0
  let retainedIdentities = 0
  const assets = selection.assets.map((asset) => {
    const htmlPath = outputHtmlPath(OUT_DIR, asset.url)
    let identity
    if (fs.existsSync(htmlPath)) {
      identity = parseRenderedPageIdentity(fs.readFileSync(htmlPath, 'utf8'), asset.url)
      identity.redirectTarget = redirects.get(normalizeUrlPath(asset.url)) ?? null
      identity.fingerprint = identityFingerprint(identity)
      identity.baselineSource = 'rendered_output'
      readyIdentities += 1
    } else {
      const previousIdentity = existingByUrl.get(normalizeUrlPath(asset.url))?.identity
      if (previousIdentity?.status === 'ready' && previousIdentity.fingerprint) {
        identity = { ...previousIdentity, baselineSource: 'retained_prior_baseline' }
        retainedIdentities += 1
      } else {
        identity = { status: 'pending_render_fingerprint' }
      }
    }

    return {
      url: asset.url,
      ...resolveSourceOwnership(asset.url),
      citations: asset.citations,
      share: rounded(asset.share),
      cumulativeShare: rounded(asset.cumulativeShare),
      protectionReason: asset.protectionReason,
      identity,
    }
  })

  const ledger = {
    schemaVersion: 1,
    snapshotLabel: snapshotLabelFrom(latest.name),
    sourceExport: latest.name,
    totalCitations: selection.totalCitations,
    policy,
    protectedCitations: selection.protectedCitations,
    protectedCitationShare: rounded(selection.protectedCitationShare),
    assets,
  }

  fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true })
  fs.writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`)
  console.log(
    `[ai-citation-assets] protected ${assets.length} URLs, ${selection.protectedCitations}/${selection.totalCitations} citations (${(selection.protectedCitationShare * 100).toFixed(2)}%)`,
  )
  console.log(
    `[ai-citation-assets] identities: ${readyIdentities} captured from out/, ${retainedIdentities} retained, ${assets.length - readyIdentities - retainedIdentities} pending`,
  )
  console.log(`[ai-citation-assets] wrote ${path.relative(ROOT, LEDGER_PATH)}`)
}

main()
