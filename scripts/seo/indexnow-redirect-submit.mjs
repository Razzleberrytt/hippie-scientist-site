#!/usr/bin/env node
/**
 * Notify IndexNow when first-party permanent redirects change.
 *
 * The normal IndexNow tracker fingerprints indexable HTML. Redirect-only URLs
 * do not have HTML to fingerprint, so canonical migrations can otherwise be
 * invisible to automatic submissions. This companion tracker watches exact
 * first-party 301/308 rules and submits both the changed source and canonical
 * destination through the main IndexNow payload implementation.
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
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
const REDIRECTS_PATH = path.join(ROOT, String(flag('redirects', 'out/_redirects')))
const STATE_PATH = path.join(ROOT, String(flag('state', 'ops/indexnow-redirect-state.json')))
const MAIN_SCRIPT = path.join(ROOT, 'scripts/seo/indexnow-submit.mjs')
const DO_SUBMIT = flag('submit', false) === true
const DO_BOOTSTRAP = flag('bootstrap', false) === true
const DO_BASELINE = flag('baseline', false) === true
const ALLOW_FIRST_RUN = flag('allow-first-run', false) === true

function normalizeFirstPartyUrl(value) {
  const raw = String(value || '').trim()
  if (!raw || raw.includes('*') || raw.includes(':splat')) return null

  try {
    const parsed = raw.startsWith('http://') || raw.startsWith('https://')
      ? new URL(raw)
      : new URL(raw, SITE_URL)
    if (parsed.host !== SITE_HOST) return null
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    parsed.protocol = 'https:'
    parsed.hash = ''
    return parsed.href
  } catch {
    return null
  }
}

function collectPermanentRedirects() {
  if (!existsSync(REDIRECTS_PATH)) return new Map()
  const redirects = new Map()

  for (const line of readFileSync(REDIRECTS_PATH, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [source, target, status] = trimmed.split(/\s+/)
    if (!source || !target || !['301', '308'].includes(status)) continue

    const sourceUrl = normalizeFirstPartyUrl(source)
    const targetUrl = normalizeFirstPartyUrl(target)
    if (!sourceUrl || !targetUrl || sourceUrl === targetUrl) continue
    redirects.set(sourceUrl, targetUrl)
  }

  return redirects
}

function loadState() {
  if (!existsSync(STATE_PATH)) return { lastSubmittedAt: null, redirects: {} }
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    if (!state || typeof state !== 'object' || typeof state.redirects !== 'object') throw new Error('invalid schema')
    return state
  } catch (error) {
    console.warn(`[indexnow-redirects] Ignoring invalid state ${path.relative(ROOT, STATE_PATH)}: ${error.message}`)
    return { lastSubmittedAt: null, redirects: {} }
  }
}

function saveState(redirects, extra = {}) {
  mkdirSync(path.dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, `${JSON.stringify({
    ...extra,
    redirects: Object.fromEntries([...redirects.entries()].sort(([a], [b]) => a.localeCompare(b))),
  }, null, 2)}\n`)
}

function submitViaMain(urls) {
  const payloadPath = path.join(ROOT, 'ops/.indexnow-redirect-payload.json')
  mkdirSync(path.dirname(payloadPath), { recursive: true })
  writeFileSync(payloadPath, `${JSON.stringify({ host: SITE_HOST, urlList: urls }, null, 2)}\n`)

  try {
    const result = spawnSync(process.execPath, [MAIN_SCRIPT, `--payload=${payloadPath}`, '--submit'], {
      cwd: ROOT,
      env: process.env,
      stdio: 'inherit',
    })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`IndexNow payload submission exited with status ${result.status}`)
  } finally {
    try {
      unlinkSync(payloadPath)
    } catch {
      // Best-effort cleanup only.
    }
  }
}

function printUrls(urls) {
  for (const url of urls.slice(0, 20)) console.log(`  ${url}`)
  if (urls.length > 20) console.log(`  … and ${urls.length - 20} more`)
}

function main() {
  const redirects = collectPermanentRedirects()
  const state = loadState()
  const previous = state.redirects || {}
  const isFirstRun = Object.keys(previous).length === 0

  const added = []
  const changed = []
  for (const [source, target] of redirects) {
    if (previous[source] === undefined) added.push({ source, target })
    else if (previous[source] !== target) changed.push({ source, target, previousTarget: previous[source] })
  }
  const removed = Object.entries(previous)
    .filter(([source]) => !redirects.has(source))
    .map(([source, target]) => ({ source, target }))

  const urls = [...new Set([
    ...added.flatMap(({ source, target }) => [source, target]),
    ...changed.flatMap(({ source, target, previousTarget }) => [source, target, previousTarget]),
    ...removed.flatMap(({ source, target }) => [source, target]),
  ].filter(Boolean))]

  console.log('\nIndexNow redirect submission')
  console.log('='.repeat(60))
  console.log(`Tracked redirects ${redirects.size}`)
  console.log(`Last submitted    ${state.lastSubmittedAt ?? 'never'}`)
  console.log(`New rules         ${added.length}`)
  console.log(`Changed rules     ${changed.length}`)
  console.log(`Removed rules     ${removed.length}`)
  console.log(`URLs to notify    ${urls.length}`)
  printUrls(urls)

  if (DO_BASELINE || (DO_BOOTSTRAP && isFirstRun)) {
    saveState(redirects, {
      lastSubmittedAt: state.lastSubmittedAt,
      baselinedAt: new Date().toISOString(),
    })
    console.log(`\n[indexnow-redirects] Baseline recorded in ${path.relative(ROOT, STATE_PATH)}. Nothing was submitted.`)
    return
  }

  if (isFirstRun && DO_SUBMIT && !ALLOW_FIRST_RUN) {
    console.error('\n[indexnow-redirects] Refusing a first-run submission of all historical redirects.')
    console.error('  Use --submit --bootstrap in CI so existing redirects become the baseline.')
    console.error('  Use --submit --allow-first-run only for an intentional migration-wide notification.')
    process.exit(1)
  }

  if (!urls.length) {
    console.log('\n[indexnow-redirects] No permanent redirect changes. Nothing to submit.')
    return
  }

  if (!DO_SUBMIT) {
    console.log('\n[indexnow-redirects] Dry run — nothing was sent.')
    return
  }

  submitViaMain(urls)
  saveState(redirects, { lastSubmittedAt: new Date().toISOString() })
  console.log(`\n[indexnow-redirects] Submitted ${urls.length} URL(s); state saved to ${path.relative(ROOT, STATE_PATH)}`)
}

try {
  main()
} catch (error) {
  console.error(`[indexnow-redirects] ${error.message}`)
  process.exit(1)
}
