#!/usr/bin/env node
/**
 * Submit changed site URLs to IndexNow.
 *
 * Normal mode fingerprints the static export and compares it with the last
 * successful submission state. Explicit payload mode submits exactly the URLs
 * from a standard IndexNow JSON payload, which is useful for migrations,
 * redirects, and consolidation recrawls.
 *
 * Examples:
 *   node scripts/seo/indexnow-submit.mjs --baseline
 *   node scripts/seo/indexnow-submit.mjs --submit
 *   node scripts/seo/indexnow-submit.mjs --payload=payload.json
 *   node scripts/seo/indexnow-submit.mjs --payload=payload.json --submit
 */

import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const SITE_HOST = String(flag('host', process.env.INDEXNOW_HOST || 'thehippiescientist.net')).trim()
const SITE_URL = `https://${SITE_HOST}`
const OUT_DIR = path.join(ROOT, String(flag('dir', 'out')))
const STATE_PATH = path.join(ROOT, String(flag('state', 'ops/indexnow-state.json')))
const PUBLIC_DIR = path.join(ROOT, 'public')
const ENDPOINT = String(flag('endpoint', process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow'))
const MAX_URLS_PER_REQUEST = 10_000
const KEY_RE = /^[a-z0-9-]{8,128}$/i
const FINGERPRINT_VERSION = 2

const DO_SUBMIT = flag('submit', false) === true
const DO_INIT = flag('init', false) === true
const DO_BASELINE = flag('baseline', false) === true
const DO_BOOTSTRAP = flag('bootstrap', false) === true
const ALLOW_FIRST_RUN = flag('allow-first-run', false) === true
const SKIP_KEY_CHECK = flag('skip-key-check', false) === true
const PAYLOAD_PATH = flag('payload', null)
const LIMIT = Number(flag('limit', 0))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/* -------------------------------------------------------------------- key -- */

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

function resolveKey(preferredKey = null) {
  const envKey = process.env.INDEXNOW_KEY?.trim()
  const existing = findExistingKeyFile()
  const keys = [
    ['payload', preferredKey?.trim()],
    ['INDEXNOW_KEY', envKey],
    ['public key file', existing?.key],
  ].filter(([, key]) => key)

  for (const [source, key] of keys) {
    if (!KEY_RE.test(key)) throw new Error(`Invalid IndexNow key from ${source}.`)
  }

  const distinct = new Set(keys.map(([, key]) => key))
  if (distinct.size > 1) {
    throw new Error(
      `IndexNow key mismatch: ${keys.map(([source, key]) => `${source}=${key.slice(0, 8)}…`).join(', ')}`,
    )
  }

  return keys[0]?.[1] || null
}

function initKey() {
  const existing = findExistingKeyFile()
  if (existing) {
    console.log(`[indexnow] Key file already present: public/${existing.file}`)
    return existing.key
  }
  const key = randomUUID().replace(/-/g, '')
  mkdirSync(PUBLIC_DIR, { recursive: true })
  writeFileSync(path.join(PUBLIC_DIR, `${key}.txt`), `${key}\n`)
  console.log(`[indexnow] Created public/${key}.txt`)
  console.log('[indexnow] Commit and deploy this file before submitting URLs.')
  return key
}

async function verifyRemoteKey(key, keyLocation) {
  if (SKIP_KEY_CHECK || !DO_SUBMIT) return

  let lastError = null
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(keyLocation, {
        headers: { 'user-agent': 'thehippiescientist-indexnow/1.0' },
        redirect: 'follow',
      })
      const body = (await response.text()).trim()
      if (response.ok && body === key) {
        console.log(`[indexnow] Verified key at ${keyLocation}`)
        return
      }
      lastError = new Error(`HTTP ${response.status}; body did not match the configured key`)
    } catch (error) {
      lastError = error
    }

    if (attempt < 5) await sleep(attempt * 1500)
  }

  throw new Error(`Could not verify IndexNow key at ${keyLocation}: ${lastError?.message || 'unknown error'}`)
}

/* ------------------------------------------------------------ fingerprint -- */

const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi
const STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi
const JSON_LD_RE = /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi
const BUILD_NOISE_RE = /(__BUILD_DATE__|__BUILD_TIME__|__COMMIT_HASH__|data-build-[a-z-]+="[^"]*"|content="\d{4}-\d{2}-\d{2}T[^"]*")/g

function attr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return tag.match(new RegExp(`\\b${escaped}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]?.trim() || ''
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((result, key) => {
        result[key] = stableClone(value[key])
        return result
      }, {})
  }
  return value
}

function normalizeJsonLd(raw) {
  const cleaned = raw.replace(BUILD_NOISE_RE, '').trim()
  if (!cleaned) return ''
  try {
    return JSON.stringify(stableClone(JSON.parse(cleaned)))
  } catch {
    return cleaned.replace(/\s+/g, ' ')
  }
}

function collectSeoSignals(html) {
  const cleaned = html.replace(BUILD_NOISE_RE, '')
  const signals = []

  const title = cleaned.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (title) signals.push(`title:${title}`)

  for (const match of cleaned.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0]
    const name = attr(tag, 'name').toLowerCase()
    const property = attr(tag, 'property').toLowerCase()
    const content = attr(tag, 'content')
    if (!content) continue

    if (['description', 'robots', 'googlebot'].includes(name)) {
      signals.push(`meta:${name}:${content}`)
    } else if (name.startsWith('twitter:')) {
      signals.push(`meta:${name}:${content}`)
    } else if (property.startsWith('og:')) {
      signals.push(`meta:${property}:${content}`)
    }
  }

  for (const match of cleaned.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0]
    const rel = attr(tag, 'rel').toLowerCase()
    if (!rel) continue
    if (!rel.split(/\s+/).some((value) => ['canonical', 'alternate'].includes(value))) continue

    const href = attr(tag, 'href')
    if (!href) continue
    const hreflang = attr(tag, 'hreflang')
    const type = attr(tag, 'type')
    signals.push(`link:${rel}:${hreflang}:${type}:${href}`)
  }

  const internalLinks = new Set()
  for (const match of cleaned.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(match[0], 'href')
    if (!href || href.startsWith('#')) continue
    if (href.startsWith('/') || href.startsWith(`${SITE_URL}/`) || href === SITE_URL) {
      internalLinks.add(href)
    }
  }
  for (const href of [...internalLinks].sort((a, b) => a.localeCompare(b))) {
    signals.push(`a:${href}`)
  }

  for (const match of cleaned.matchAll(JSON_LD_RE)) {
    const normalized = normalizeJsonLd(match[1])
    if (normalized) signals.push(`jsonld:${normalized}`)
  }

  return [...new Set(signals)].sort((a, b) => a.localeCompare(b))
}

function fingerprint(html) {
  const cleaned = html.replace(BUILD_NOISE_RE, '')
  const body = cleaned
    .replace(SCRIPT_RE, '')
    .replace(STYLE_RE, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const seoSignals = collectSeoSignals(cleaned)
  return createHash('sha1')
    .update(`${body}\n${seoSignals.join('\n')}`)
    .digest('hex')
    .slice(0, 16)
}

function isNoindex(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0]
    if (!/\bname\s*=\s*["']robots["']/i.test(tag)) continue
    if (/\bcontent\s*=\s*["'][^"']*\bnoindex\b[^"']*["']/i.test(tag)) return true
  }
  return false
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
      if (isNoindex(html)) continue
      pages.set(prefix || '/', fingerprint(html))
    }
  }

  walk(dir, '/')
  return pages
}

/* ------------------------------------------------------------------ state -- */

function loadState() {
  if (!existsSync(STATE_PATH)) return { lastSubmittedAt: null, fingerprintVersion: null, fingerprints: {} }
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    if (!state || typeof state !== 'object' || typeof state.fingerprints !== 'object') throw new Error('invalid schema')
    return state
  } catch (error) {
    console.warn(`[indexnow] Ignoring invalid state file ${path.relative(ROOT, STATE_PATH)}: ${error.message}`)
    return { lastSubmittedAt: null, fingerprintVersion: null, fingerprints: {} }
  }
}

function saveState(state) {
  mkdirSync(path.dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`)
}

function currentFingerprintState(pages, extra = {}) {
  return {
    ...extra,
    fingerprintVersion: FINGERPRINT_VERSION,
    fingerprints: Object.fromEntries(pages),
  }
}

/* --------------------------------------------------------------- payload -- */

function validateUrlList(values, host) {
  if (!Array.isArray(values)) throw new Error('IndexNow payload urlList must be an array.')

  const output = []
  const seen = new Set()
  for (const value of values) {
    let parsed
    try {
      parsed = new URL(String(value))
    } catch {
      throw new Error(`Invalid URL in IndexNow payload: ${value}`)
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`Unsupported URL protocol: ${parsed.href}`)
    if (parsed.host !== host) throw new Error(`URL does not belong to ${host}: ${parsed.href}`)
    if (!seen.has(parsed.href)) {
      seen.add(parsed.href)
      output.push(parsed.href)
    }
  }
  return output
}

function loadPayload(filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath)
  let payload
  try {
    payload = JSON.parse(readFileSync(absolute, 'utf8'))
  } catch (error) {
    throw new Error(`Could not read IndexNow payload ${filePath}: ${error.message}`)
  }

  if (!payload || typeof payload !== 'object') throw new Error('IndexNow payload must be a JSON object.')
  const host = String(payload.host || SITE_HOST).trim()
  if (host !== SITE_HOST) throw new Error(`Payload host ${host} does not match configured host ${SITE_HOST}.`)

  const key = resolveKey(payload.key ? String(payload.key) : null)
  if (!key) throw new Error('No IndexNow key found for payload submission.')

  const keyLocation = String(payload.keyLocation || `${SITE_URL}/${key}.txt`)
  const parsedKeyLocation = new URL(keyLocation)
  if (parsedKeyLocation.host !== SITE_HOST) {
    throw new Error(`Payload keyLocation must be hosted on ${SITE_HOST}.`)
  }

  let urls = validateUrlList(payload.urlList, SITE_HOST)
  if (LIMIT > 0) urls = urls.slice(0, LIMIT)
  return { key, keyLocation, urls, source: path.relative(ROOT, absolute) || absolute }
}

/* --------------------------------------------------------------- submit -- */

async function submitBatch({ batch, key, keyLocation, index, total }) {
  let lastError = null

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: SITE_HOST, key, keyLocation, urlList: batch }),
      })

      if (response.status === 200 || response.status === 202) {
        console.log(`[indexnow] Batch ${index}/${total}: HTTP ${response.status} (${batch.length} URLs)`)
        return
      }

      const body = await response.text().catch(() => '')
      const error = new Error(`HTTP ${response.status} ${response.statusText}${body ? ` — ${body.slice(0, 300)}` : ''}`)

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after'))
        if (attempt < 3 && Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 60) {
          await sleep(retryAfter * 1000)
          lastError = error
          continue
        }
        throw error
      }

      if (response.status >= 500 && attempt < 3) {
        lastError = error
        await sleep(attempt * 1500)
        continue
      }

      throw error
    } catch (error) {
      lastError = error
      if (attempt < 3 && !/^HTTP 4\d\d/.test(error.message)) {
        await sleep(attempt * 1500)
        continue
      }
      break
    }
  }

  throw new Error(`Batch ${index}/${total} failed after retries: ${lastError?.message || 'unknown error'}`)
}

async function submitUrls(urls, key, keyLocation) {
  if (!urls.length) return
  await verifyRemoteKey(key, keyLocation)

  const batches = []
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    batches.push(urls.slice(i, i + MAX_URLS_PER_REQUEST))
  }

  for (const [index, batch] of batches.entries()) {
    await submitBatch({ batch, key, keyLocation, index: index + 1, total: batches.length })
  }
}

function printUrls(urls) {
  for (const url of urls.slice(0, 20)) console.log(`  ${url}`)
  if (urls.length > 20) console.log(`  … and ${urls.length - 20} more`)
}

/* ------------------------------------------------------------------- main -- */

async function main() {
  if (DO_INIT) {
    initKey()
    return
  }

  if (PAYLOAD_PATH) {
    const { key, keyLocation, urls, source } = loadPayload(String(PAYLOAD_PATH))
    console.log('\nIndexNow explicit payload')
    console.log('='.repeat(60))
    console.log(`Source       ${source}`)
    console.log(`Host         ${SITE_HOST}`)
    console.log(`Key          ${key.slice(0, 8)}…`)
    console.log(`Key location ${keyLocation}`)
    console.log(`URLs         ${urls.length}`)
    printUrls(urls)

    if (!urls.length) {
      console.log('\n[indexnow] Payload contains no URLs after validation.')
      return
    }
    if (!DO_SUBMIT) {
      console.log('\n[indexnow] Dry run — payload validated; nothing was sent.')
      console.log('  Re-run with --submit to notify IndexNow.')
      return
    }

    await submitUrls(urls, key, keyLocation)
    console.log(`\n[indexnow] Submitted ${urls.length} explicit URL(s). Fingerprint state was not changed.`)
    return
  }

  const key = resolveKey()
  if (!key) {
    console.error('[indexnow] No key found.')
    console.error('  Run: node scripts/seo/indexnow-submit.mjs --init')
    console.error('  Or set INDEXNOW_KEY and commit/deploy the matching public/<key>.txt')
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
  const stateFingerprintVersion = Number(state.fingerprintVersion || 1)

  const added = []
  const changed = []
  for (const [route, hash] of pages) {
    if (previous[route] === undefined) added.push(route)
    else if (previous[route] !== hash) changed.push(route)
  }
  const removed = Object.keys(previous).filter((route) => !pages.has(route))

  let routes = [...added, ...changed, ...removed]
  if (LIMIT > 0) routes = routes.slice(0, LIMIT)
  const urls = routes.map((route) => `${SITE_URL}${route}`)
  const keyLocation = `${SITE_URL}/${key}.txt`

  console.log('\nIndexNow submission')
  console.log('='.repeat(60))
  console.log(`Host           ${SITE_HOST}`)
  console.log(`Key            ${key.slice(0, 8)}…`)
  console.log(`Fingerprint v  ${FINGERPRINT_VERSION} (state: ${isFirstRun ? 'none' : stateFingerprintVersion})`)
  console.log(`Indexable      ${pages.size} pages in ${path.relative(ROOT, OUT_DIR)}/`)
  console.log(`Last submitted ${state.lastSubmittedAt ?? 'never'}`)
  console.log(`New            ${added.length}`)
  console.log(`Updated        ${changed.length}`)
  console.log(`Removed        ${removed.length}`)
  console.log(`To submit      ${urls.length}`)
  printUrls(urls)

  if (DO_BASELINE || (DO_BOOTSTRAP && isFirstRun)) {
    saveState(currentFingerprintState(pages, {
      lastSubmittedAt: state.lastSubmittedAt,
      baselinedAt: new Date().toISOString(),
    }))
    console.log(`\n[indexnow] Baseline recorded in ${path.relative(ROOT, STATE_PATH)}. Nothing was submitted.`)
    return
  }

  if (!isFirstRun && stateFingerprintVersion !== FINGERPRINT_VERSION) {
    console.log(`\n[indexnow] Fingerprint algorithm changed from v${stateFingerprintVersion} to v${FINGERPRINT_VERSION}.`)
    if (!DO_SUBMIT && !DO_BOOTSTRAP) {
      console.log('[indexnow] Dry run — state was not migrated. Re-run the production submission to establish the new baseline safely.')
      return
    }

    saveState(currentFingerprintState(pages, {
      lastSubmittedAt: state.lastSubmittedAt,
      baselinedAt: new Date().toISOString(),
      migratedFromFingerprintVersion: stateFingerprintVersion,
    }))
    console.log('[indexnow] New fingerprint baseline recorded without submitting every page as falsely changed.')
    return
  }

  if (isFirstRun && DO_SUBMIT && !ALLOW_FIRST_RUN) {
    console.error('\n[indexnow] Refusing a first-run full-site submission without an explicit override.')
    console.error('  Recommended: use --baseline once, then submit only future changes.')
    console.error('  CI: use --submit --bootstrap so the first run safely creates the baseline.')
    console.error('  Override only when intentional: --submit --allow-first-run')
    process.exit(1)
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

  await submitUrls(urls, key, keyLocation)
  saveState(currentFingerprintState(pages, { lastSubmittedAt: new Date().toISOString() }))
  console.log(`\n[indexnow] Submitted ${urls.length} URL(s); state saved to ${path.relative(ROOT, STATE_PATH)}`)
}

main().catch((error) => {
  console.error(`[indexnow] ${error.message}`)
  process.exit(1)
})
