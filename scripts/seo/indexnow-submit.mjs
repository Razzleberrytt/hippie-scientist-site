#!/usr/bin/env node
/**
 * indexnow-submit.mjs
 *
 * Pushes new and updated URLs to IndexNow (Bing, Yandex, Seznam, Naver) so
 * content changes reach search and AI-grounding systems in minutes instead of
 * waiting for a recrawl. Bing explicitly recommends it for keeping AI answers
 * current.
 *
 * Only *changed* URLs are submitted. The script fingerprints each page in the
 * built export and diffs against the last submission, because blasting the full
 * sitemap on every deploy trains the endpoint to ignore you.
 *
 * ── Setup (once) ────────────────────────────────────────────────────────────
 *   node scripts/seo/indexnow-submit.mjs --init
 *
 * That writes `public/<key>.txt` containing the key, which is how IndexNow
 * verifies ownership. Commit it — the file must be served from the site root.
 * In CI, set INDEXNOW_KEY so the same key is reused across builds.
 *
 * ── Normal use ──────────────────────────────────────────────────────────────
 *   node scripts/seo/indexnow-submit.mjs            # dry run: show what would go
 *   node scripts/seo/indexnow-submit.mjs --submit   # actually notify IndexNow
 *
 * Dry run is the default on purpose: submitting is an outward-facing action.
 *
 * State: ops/indexnow-state.json (fingerprints of the last submitted build)
 */

import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const SITE_HOST = String(flag('host', process.env.INDEXNOW_HOST || 'thehippiescientist.net'))
const SITE_URL = `https://${SITE_HOST}`
const OUT_DIR = path.join(ROOT, String(flag('dir', 'out')))
const STATE_PATH = path.join(ROOT, 'ops', 'indexnow-state.json')
const PUBLIC_DIR = path.join(ROOT, 'public')
const ENDPOINT = 'https://api.indexnow.org/IndexNow'
const MAX_URLS_PER_REQUEST = 10000

const DO_SUBMIT = flag('submit', false) === true
const DO_INIT = flag('init', false) === true
const LIMIT = Number(flag('limit', 0))

/* -------------------------------------------------------------------- key -- */

// IndexNow keys are 8-128 characters of [a-zA-Z0-9-], not just hex. `--init`
// happens to mint a hex key, so a hex-only pattern silently fails to discover a
// valid non-hex key that is already committed and served — and `initKey()` would
// then mint a *second* key file alongside the live one, which IndexNow rejects
// because the signing key must be the one served from the site root.
// The `contents === key` check below is what actually identifies a key file, so
// widening the filename pattern does not misclassify other public/*.txt files.
function findExistingKeyFile() {
  if (!existsSync(PUBLIC_DIR)) return null
  for (const file of readdirSync(PUBLIC_DIR)) {
    const match = /^([a-z0-9-]{8,128})\.txt$/i.exec(file)
    if (!match) continue
    const contents = readFileSync(path.join(PUBLIC_DIR, file), 'utf8').trim()
    if (contents === match[1]) return { key: match[1], file }
  }
  return null
}

function resolveKey() {
  const envKey = process.env.INDEXNOW_KEY?.trim()
  const existing = findExistingKeyFile()

  if (envKey && existing && envKey !== existing.key) {
    console.warn(
      `[indexnow] WARNING: INDEXNOW_KEY (${envKey.slice(0, 8)}…) does not match ` +
        `public/${existing.file}. IndexNow will reject submissions signed with a key ` +
        'that is not served from the site root.',
    )
  }

  return envKey || existing?.key || null
}

function initKey() {
  const existing = findExistingKeyFile()
  if (existing) {
    console.log(`[indexnow] Key file already present: public/${existing.file}`)
    return existing.key
  }
  const key = randomUUID().replace(/-/g, '')
  mkdirSync(PUBLIC_DIR, { recursive: true })
  writeFileSync(path.join(PUBLIC_DIR, `${key}.txt`), key)
  console.log(`[indexnow] Created public/${key}.txt`)
  console.log('[indexnow] Commit this file — IndexNow fetches it to verify ownership.')
  console.log(`[indexnow] Set INDEXNOW_KEY=${key} in CI to reuse it across builds.`)
  return key
}

/* ------------------------------------------------------------ fingerprint -- */

const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi
const STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi
const BUILD_NOISE_RE = /(__BUILD_DATE__|__BUILD_TIME__|__COMMIT_HASH__|data-build-[a-z-]+="[^"]*"|content="\d{4}-\d{2}-\d{2}T[^"]*")/g

/**
 * Hash the *rendered* content only. Scripts, styles, and build stamps change on
 * every deploy without the page meaning anything different — including them
 * would make every URL look updated every time.
 */
function fingerprint(html) {
  const body = html
    .replace(SCRIPT_RE, '')
    .replace(STYLE_RE, '')
    .replace(BUILD_NOISE_RE, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return createHash('sha1').update(body).digest('hex').slice(0, 16)
}

function collectPages(dir) {
  if (!existsSync(dir)) return new Map()
  const pages = new Map()

  const walk = (current, prefix) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
        walk(path.join(current, entry.name), `${prefix}${entry.name}/`)
        continue
      }
      if (entry.name !== 'index.html') continue
      const html = readFileSync(path.join(current, entry.name), 'utf8')
      // Never ask a search engine to index a page we tell it not to index.
      if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue
      pages.set(prefix || '/', fingerprint(html))
    }
  }

  walk(dir, '/')
  return pages
}

/* ------------------------------------------------------------------ state -- */

function loadState() {
  if (!existsSync(STATE_PATH)) return { lastSubmittedAt: null, fingerprints: {} }
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'))
  } catch {
    return { lastSubmittedAt: null, fingerprints: {} }
  }
}

function saveState(state) {
  mkdirSync(path.dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`)
}

/* ------------------------------------------------------------------- main -- */

async function main() {
  if (DO_INIT) {
    initKey()
    return
  }

  const key = resolveKey()
  if (!key) {
    console.error('[indexnow] No key found.')
    console.error('  Run: node scripts/seo/indexnow-submit.mjs --init')
    console.error('  Or set INDEXNOW_KEY and commit the matching public/<key>.txt')
    process.exit(1)
  }

  const pages = collectPages(OUT_DIR)
  if (!pages.size) {
    console.error(`[indexnow] No indexable pages found in ${path.relative(ROOT, OUT_DIR)}/. Build first.`)
    process.exit(1)
  }

  const state = loadState()
  const previous = state.fingerprints ?? {}
  const isFirstRun = Object.keys(previous).length === 0

  const added = []
  const changed = []
  for (const [route, hash] of pages) {
    if (previous[route] === undefined) added.push(route)
    else if (previous[route] !== hash) changed.push(route)
  }
  const removed = Object.keys(previous).filter((route) => !pages.has(route))

  let urls = [...added, ...changed].map((route) => `${SITE_URL}${route}`)
  if (LIMIT > 0) urls = urls.slice(0, LIMIT)

  console.log('\nIndexNow submission')
  console.log('='.repeat(60))
  console.log(`Host           ${SITE_HOST}`)
  console.log(`Key            ${key.slice(0, 8)}…`)
  console.log(`Indexable      ${pages.size} pages in ${path.relative(ROOT, OUT_DIR)}/`)
  console.log(`Last submitted ${state.lastSubmittedAt ?? 'never'}`)
  console.log(`New            ${added.length}`)
  console.log(`Updated        ${changed.length}`)
  console.log(`Gone           ${removed.length} (not submitted; IndexNow is for live URLs)`)
  console.log(`To submit      ${urls.length}`)

  if (isFirstRun) {
    console.log('\nFirst run: every page looks new because there is no baseline yet.')
    console.log('Record the baseline without notifying anyone:')
    console.log('  node scripts/seo/indexnow-submit.mjs --baseline')
  }

  for (const url of urls.slice(0, 15)) console.log(`  ${url}`)
  if (urls.length > 15) console.log(`  … and ${urls.length - 15} more`)

  if (flag('baseline', false) === true) {
    saveState({ lastSubmittedAt: state.lastSubmittedAt, baselinedAt: new Date().toISOString(), fingerprints: Object.fromEntries(pages) })
    console.log(`\n[indexnow] Baseline recorded in ${path.relative(ROOT, STATE_PATH)}. Nothing was submitted.`)
    return
  }

  if (!urls.length) {
    console.log('\n[indexnow] Nothing changed. No submission needed.')
    return
  }

  if (!DO_SUBMIT) {
    console.log('\n[indexnow] Dry run — nothing was sent.')
    console.log('  Re-run with --submit to notify IndexNow.')
    return
  }

  const batches = []
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    batches.push(urls.slice(i, i + MAX_URLS_PER_REQUEST))
  }

  for (const [i, batch] of batches.entries()) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: SITE_HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: batch }),
    })

    // 200 accepted · 202 accepted, key pending validation.
    if (!response.ok && response.status !== 202) {
      const body = await response.text().catch(() => '')
      console.error(`[indexnow] Batch ${i + 1}/${batches.length} failed: ${response.status} ${response.statusText}`)
      if (body) console.error(`  ${body.slice(0, 300)}`)
      process.exit(1)
    }
    console.log(`[indexnow] Batch ${i + 1}/${batches.length}: ${response.status} (${batch.length} URLs)`)
  }

  saveState({ lastSubmittedAt: new Date().toISOString(), fingerprints: Object.fromEntries(pages) })
  console.log(`\n[indexnow] Submitted ${urls.length} URL(s); state saved to ${path.relative(ROOT, STATE_PATH)}`)
}

main().catch((error) => {
  console.error(`[indexnow] ${error.message}`)
  process.exit(1)
})
