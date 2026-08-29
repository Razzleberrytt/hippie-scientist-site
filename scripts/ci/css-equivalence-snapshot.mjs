#!/usr/bin/env node
/**
 * Computed-style equivalence harness.
 *
 * The stylesheet consolidation is a refactor: the site must look identical when
 * it is finished. Screenshots are the wrong instrument for proving that — font
 * rasterisation and subpixel layout vary between runs, so pixel diffs are noisy
 * in exactly the range a real regression lives in. Computed styles are exact.
 *
 * For every (route x theme x viewport), this loads the built page in headless
 * Chrome, walks a fixed list of structural selectors, and records
 * `getComputedStyle` for each match. Output is a stable-sorted JSON snapshot, so
 * a diff against the baseline is a diff in rendered style and nothing else.
 *
 * It drives the browser already installed on the machine over the DevTools
 * Protocol using Node's native WebSocket, so it adds no dependency and
 * downloads nothing.
 *
 * Usage:
 *   node scripts/ci/css-equivalence-snapshot.mjs --out artifacts/css-equivalence/baseline
 *   node scripts/ci/css-equivalence-snapshot.mjs --out artifacts/css-equivalence/current
 *   node scripts/ci/css-equivalence-snapshot.mjs --compare artifacts/css-equivalence/baseline
 *
 * Requires a built `out/` directory.
 *
 * Both captures must come from the SAME build command. Elements are keyed by
 * their index within a selector match, so if the DOM shifts the comparison
 * reports hundreds of differences that are really one element sliding down the
 * list. `npm run build` runs post-build steps that rewrite the emitted HTML
 * (canonical repair, content-depth injection, blog h1 repair); `npx next build`
 * does not. Comparing one against the other produces exactly that false
 * failure, and it looks like a catastrophic style regression.
 */

import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { execSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT_DIR = path.join(ROOT, 'out')

const args = process.argv.slice(2)
const argValue = (flag) => {
  const i = args.indexOf(flag)
  return i === -1 ? null : args[i + 1]
}
const writeTo = argValue('--out')
const compareTo = argValue('--compare')

/**
 * One page per route family the stylesheets actually target. A herb detail and
 * a compound detail are included because the route-scoped sheets
 * (herb-profile-polish, compact-safety-cautions) only load there.
 */
const ROUTES = [
  ['home', '/'],
  ['herbs-index', '/herbs/'],
  ['herb-detail', '/herbs/ashwagandha/'],
  ['compounds-index', '/compounds/'],
  ['compound-detail', '/compounds/l-theanine/'],
  ['guide', '/guides/sleep/'],
  ['evidence', '/evidence/evidence-checker/'],
  ['info', '/info/about/'],
  ['locale-de', '/de/'],
]

const THEMES = ['light', 'dark']
const VIEWPORTS = [
  ['320', 320, 720],
  ['768', 768, 1024],
  ['1440', 1440, 900],
]

/**
 * Structural selectors — the surfaces the consolidation touches. Deliberately
 * broad: headings, body copy, links, cards, buttons, tables, and the named
 * component surfaces the stylesheets declare.
 */
const SELECTORS = [
  'body', 'main', 'header', 'footer', 'nav', 'article', 'section', 'aside',
  'h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'blockquote',
  'button', 'input', 'label', 'table', 'th', 'td', 'code', 'pre', 'hr', 'img', 'figure',
  '[class*="card"]', '[class*="premium"]', '[class*="surface"]', '[class*="hero"]',
  '[class*="badge"]', '[class*="chip"]', '[class*="pill"]', '[class*="panel"]',
  '[class*="callout"]', '[class*="evidence"]', '[class*="safety"]', '[class*="caution"]',
  '[class*="prose"]', '[class*="editorial"]', '[class*="toc"]', '[class*="matrix"]',
  '[class*="grid"]', '[class*="stack"]', '[class*="banner"]', '[class*="cta"]',
]

const PROPS = [
  'color', 'background-color', 'border-top-color', 'border-right-color',
  'border-bottom-color', 'border-left-color', 'border-top-width',
  'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius',
  'border-bottom-right-radius', 'font-family', 'font-size', 'font-weight',
  'line-height', 'letter-spacing', 'margin-top', 'margin-right', 'margin-bottom',
  'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'box-shadow', 'opacity', 'display', 'gap', 'text-align', 'text-transform',
  'text-decoration-line', 'flex-direction', 'align-items', 'justify-content',
  'position', 'z-index', 'overflow-x', 'overflow-y', 'visibility',
  // Layout properties the consolidation can plausibly disturb. Without these
  // the harness cannot see a grid collapsing to a single column, or a rail
  // losing its scroll — changes that are obvious on screen and invisible to a
  // colour-and-spacing snapshot.
  'grid-template-columns', 'grid-template-rows', 'grid-auto-flow', 'flex-wrap',
  'width', 'height', 'max-width', 'min-height', 'background-image',
  'white-space', 'word-break', 'text-overflow', 'list-style-type',
]

/** Cap matches per selector so one page cannot dominate the snapshot. */
const MAX_PER_SELECTOR = 12

// ---------------------------------------------------------------- static server

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
}

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0])
    let file = path.join(OUT_DIR, rel)
    if (rel.endsWith('/')) file = path.join(file, 'index.html')
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const alt = file.replace(/\/$/, '') + '.html'
      file = fs.existsSync(alt) ? alt : path.join(OUT_DIR, '404.html')
    }
    try {
      const body = fs.readFileSync(file)
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404); res.end('not found')
    }
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

// ------------------------------------------------------------------ CDP client

function findChrome() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]
  for (const c of candidates) if (fs.existsSync(c)) return c
  throw new Error('No Chrome or Edge found. Set CHROME_PATH.')
}

async function launchChrome(port, userDataDir) {
  const bin = process.env.CHROME_PATH || findChrome()
  const proc = spawn(bin, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu',
    '--disable-extensions', '--disable-background-networking',
    '--hide-scrollbars', '--force-device-scale-factor=1',
    'about:blank',
  ], { stdio: 'ignore' })

  for (let i = 0; i < 100; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (r.ok) return { proc, info: await r.json() }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200))
  }
  // Same leak, narrower window: a browser that never came up still has a
  // process tree holding the profile.
  killByProfile(userDataDir)
  throw new Error('Chrome did not expose a debugging port in time')
}

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function connect(url) {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  return new Cdp(ws)
}

// ------------------------------------------------------------------- extraction

/* eslint-disable no-undef -- serialised and evaluated inside the browser page */
/** Runs in the page. Returns [{ sel, i, styles }] sorted deterministically. */
const EXTRACT = (selectors, props, cap) => {
  const out = []
  for (const sel of selectors) {
    let nodes
    try { nodes = Array.from(document.querySelectorAll(sel)) } catch { continue }
    nodes.slice(0, cap).forEach((el, i) => {
      const cs = getComputedStyle(el)
      const styles = {}
      for (const p of props) styles[p] = cs.getPropertyValue(p).trim()
      out.push({ sel, i, styles })
    })
  }
  out.sort((a, b) => (a.sel === b.sel ? a.i - b.i : a.sel < b.sel ? -1 : 1))
  return out
}
/* eslint-enable no-undef */

/**
 * Pin the theme before any application script runs.
 *
 * app/layout.tsx applies the theme from `localStorage.theme` in an inline
 * script at document start. Setting the attribute after navigation loses to
 * that script and to React hydration, which is what made an earlier version of
 * this harness disagree with itself on thousands of properties: dark-theme
 * captures were recording light-theme colours.
 *
 * Transitions are disabled in the same pass. A colour mid-transition is a real
 * computed value, and sampling one is how a stable page still yields an
 * unstable snapshot.
 */
function themeBootstrap(theme) {
  return `(function () {
    try { localStorage.setItem('theme', ${JSON.stringify('PLACEHOLDER')}); } catch (e) {}
    var apply = function () {
      var d = document.documentElement
      d.classList.toggle('dark', ${JSON.stringify('PLACEHOLDER')} === 'dark')
      d.dataset.theme = ${JSON.stringify('PLACEHOLDER')}
      d.style.colorScheme = ${JSON.stringify('PLACEHOLDER')}
    }
    apply()
    document.addEventListener('DOMContentLoaded', function () {
      apply()
      var s = document.createElement('style')
      s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
      document.head.appendChild(s)
    })
  })()`.replaceAll('"PLACEHOLDER"', JSON.stringify(theme))
}

/**
 * Wait until the page has actually stopped changing.
 *
 * Watching only `body` is not enough: body settles while its descendants are
 * still transitioning, and sampling then yields colours a few units off their
 * final value — enough to make the harness disagree with itself on a couple of
 * hundred properties while looking stable.
 *
 * The probe therefore fingerprints a broad slice of the tree, and the page is
 * only considered settled when two consecutive fingerprints match.
 */
async function waitForStableStyles(cdp) {
  const probe = `(function () {
    var s = document.getElementById('__equivalence_freeze__')
    if (!s) {
      s = document.createElement('style')
      s.id = '__equivalence_freeze__'
      s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}'
    }
    // Re-append every poll: hydration can replace head content and drop it.
    document.head.appendChild(s)
    void document.body.offsetHeight

    var els = document.querySelectorAll('body,main,header,footer,article,section,aside,h1,h2,h3,p,a,button,li,input,label,figure,[class*="card"],[class*="badge"],[class*="panel"]')
    var acc = [document.readyState, document.styleSheets.length, document.documentElement.dataset.theme, els.length]
    for (var i = 0; i < els.length && i < 120; i++) {
      var cs = getComputedStyle(els[i])
      acc.push(cs.color, cs.backgroundColor, cs.fontSize, cs.paddingTop, cs.opacity)
    }
    return JSON.stringify(acc)
  })()`
  let last = null
  for (let i = 0; i < 120; i += 1) {
    const r = await cdp.send('Runtime.evaluate', { expression: probe, returnByValue: true })
    const now = r?.result?.value
    if (now && now === last && now.startsWith('["complete"')) return true
    last = now
    await new Promise((res) => setTimeout(res, 150))
  }
  return false
}

async function snapshotPage(cdp, url, theme, width, height) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 768,
  })
  await cdp.send('Page.navigate', { url })

  const settled = await waitForStableStyles(cdp)
  if (!settled) throw new Error('page styles never stabilised')

  const res = await cdp.send('Runtime.evaluate', {
    expression: `(${EXTRACT.toString()})(${JSON.stringify(SELECTORS)},${JSON.stringify(PROPS)},${MAX_PER_SELECTOR})`,
    returnByValue: true,
    awaitPromise: false,
  })
  return res.result.value || []
}

// ----------------------------------------------------------------- lifecycle
//
// An interrupted run used to leak both halves of its browser: the temp profile
// stayed in os.tmpdir(), and `proc.kill()` only ended Chrome's launcher process
// while its renderer, GPU and utility children kept running. Eleven interrupted
// runs left eleven profiles and eighty-eight processes behind.
//
// Everything that has to be released is registered here as it is acquired, and
// released exactly once from whichever exit path fires first.

const resources = { proc: null, server: null, userDataDir: null, sockets: [] }
let released = false

/**
 * Shut the browser down by profile directory, not by process id.
 *
 * On Windows the process returned by spawn() is only a launcher: it hands off
 * to the real browser and exits 0 within milliseconds. Killing that pid, or
 * guarding on its exitCode, does nothing about the eight processes still
 * running — which is exactly how eighty-eight of them accumulated.
 *
 * The `--user-data-dir` is a fresh mkdtemp path unique to this run, so matching
 * on it targets our own browser and cannot touch a real one the user has open.
 */
function killByProfile(userDataDir) {
  if (!userDataDir) return
  const marker = path.basename(userDataDir)
  try {
    if (process.platform === 'win32') {
      const ps = `Get-CimInstance Win32_Process -Filter "Name='chrome.exe' or Name='msedge.exe'" | ` +
        `Where-Object { $_.CommandLine -like '*${path.basename(userDataDir)}*' } | ` +
        `ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`
      execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, { stdio: 'ignore' })
    } else {
      execSync(`pkill -f -- "${marker}"`, { stdio: 'ignore' })
    }
  } catch { /* nothing matched, or the shell is unavailable */ }
}

function release() {
  if (released) return
  released = true
  // Open sockets keep the event loop alive, so the process would print its
  // summary and then hang until something killed it. Close them, then remove
  // anything still holding this run's profile.
  for (const ws of resources.sockets) { try { ws.close() } catch { /* already gone */ } }
  resources.sockets.length = 0
  killByProfile(resources.userDataDir)
  try { resources.server?.close() } catch { /* already closing */ }
  if (resources.userDataDir) {
    // Chrome unlinks its profile lazily, so the first attempt can lose to a
    // handle that is still closing.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try { fs.rmSync(resources.userDataDir, { recursive: true, force: true, maxRetries: 5 }); break }
      catch { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200) }
    }
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => { release(); process.exit(130) })
}
process.on('exit', release)
process.on('uncaughtException', (err) => { release(); console.error(err); process.exit(1) })
process.on('unhandledRejection', (err) => { release(); console.error(err); process.exit(1) })

/** Is this pid still running? */
function pidAlive(pid) {
  try { process.kill(pid, 0); return true } catch (err) { return err.code === 'EPERM' }
}

/**
 * A profile is abandoned when its recorded owner is gone. Without a recorded
 * owner, fall back to age.
 */
function isAbandoned(profileDir, cutoff) {
  const stamp = path.join(profileDir, 'owner.pid')
  try {
    const pid = Number.parseInt(fs.readFileSync(stamp, 'utf8').trim(), 10)
    if (Number.isFinite(pid)) {
      if (pid === process.pid) return false
      return !pidAlive(pid)
    }
  } catch { /* no stamp; fall through to the age check */ }
  try { return Date.now() - fs.statSync(profileDir).mtimeMs >= cutoff } catch { return false }
}

/**
 * Recover from earlier runs that were killed outright.
 *
 * `release()` covers every exit this process can observe, but SIGKILL and
 * `taskkill /F` cannot be intercepted, so a hard kill still strands a browser
 * and its profile. Recovery therefore happens on the next run.
 *
 * Each run stamps its own pid into `owner.pid` inside its profile. A profile
 * whose owner is no longer running is abandoned and is cleaned up immediately,
 * however recent it is. That is exact, where an age cutoff is a guess: it never
 * touches a live run, and it does not leave a killed run's browser going for an
 * hour. Profiles with no stamp fall back to the age check.
 */
function sweepStaleProfiles() {
  let swept = 0
  const cutoff = 60 * 60 * 1000
  let entries = []
  try { entries = fs.readdirSync(os.tmpdir(), { withFileTypes: true }) } catch { return 0 }
  for (const e of entries) {
    if (!e.isDirectory() || !e.name.startsWith('css-equiv-')) continue
    const full = path.join(os.tmpdir(), e.name)
    try {
      if (!isAbandoned(full, cutoff)) continue
      killByProfile(full)
      fs.rmSync(full, { recursive: true, force: true })
      swept += 1
    } catch { /* still in use, or already gone */ }
  }
  return swept
}

// ------------------------------------------------------------------------ main

async function capture() {
  if (!fs.existsSync(path.join(OUT_DIR, 'index.html'))) {
    console.error('[css-equivalence] out/ is missing or empty. Run a build first.')
    process.exit(1)
  }

  const swept = sweepStaleProfiles()
  if (swept > 0) console.log(`[css-equivalence] removed ${swept} profile(s) abandoned by earlier runs`)

  const server = await serve()
  resources.server = server
  const base = `http://127.0.0.1:${server.address().port}`
  const port = 9222 + Math.floor(process.pid % 500)
  // A fresh profile per run, outside the repository. Reusing one in-tree left
  // locked files behind whenever a run was interrupted, and a stale profile can
  // carry localStorage between runs — which is exactly the state this harness
  // sets deliberately.
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'css-equiv-'))
  resources.userDataDir = userDataDir
  // Lets a later run tell an abandoned profile from a live one exactly.
  try { fs.writeFileSync(path.join(userDataDir, 'owner.pid'), String(process.pid)) } catch { /* non-fatal */ }

  const { proc, info } = await launchChrome(port, userDataDir)
  resources.proc = proc
  const cdp = await connect(info.webSocketDebuggerUrl)
  resources.sockets.push(cdp.ws)
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })

  // Route messages for the attached page session.
  const page = {
    send: (method, params = {}) => cdp.send(method, params).catch(() => null),
  }
  const pageWs = await connect(`ws://127.0.0.1:${port}/devtools/page/${targetId}`)
  resources.sockets.push(pageWs.ws)
  await pageWs.send('Page.enable')
  await pageWs.send('Runtime.enable')
  // Belt and braces with the injected freeze stylesheet: any transition that
  // honours the media query is never started in the first place.
  await pageWs.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })

  const snapshot = {}
  let elementCount = 0

  // Theme is the outer loop: the bootstrap must be registered before any
  // navigation, and re-registering it per page would be wasted work.
  for (const theme of THEMES) {
    const { identifier } = await pageWs.send('Page.addScriptToEvaluateOnNewDocument', {
      source: themeBootstrap(theme),
    })
    for (const [routeName, routePath] of ROUTES) {
      for (const [vpName, w, h] of VIEWPORTS) {
        const key = `${routeName}|${theme}|${vpName}`
        try {
          const rows = await snapshotPage(pageWs, base + routePath, theme, w, h)
          snapshot[key] = rows
          elementCount += rows.length
          process.stdout.write(`  ${key.padEnd(40)} ${String(rows.length).padStart(5)} elements
`)
        } catch (err) {
          console.error(`  ${key} FAILED: ${err.message}`)
          snapshot[key] = { error: err.message }
        }
      }
    }
    await pageWs.send('Page.removeScriptToEvaluateOnNewDocument', { identifier })
  }

  release()

  const ordered = {}
  for (const k of Object.keys(snapshot).sort()) ordered[k] = snapshot[k]
  return { snapshot: ordered, elementCount }
}

// Snapshots are stored gzipped: 12 MB of JSON compresses to about 260 KB,
// and this file is committed and re-read on every comparison.
const SNAPSHOT_FILE = 'snapshot.json.gz'

function loadSnapshot(dir) {
  const f = path.join(ROOT, dir, SNAPSHOT_FILE)
  if (!fs.existsSync(f)) {
    console.error(`[css-equivalence] no snapshot at ${f}`)
    process.exit(1)
  }
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8'))
}

function diff(baseline, current) {
  const diffs = []
  const keys = new Set([...Object.keys(baseline), ...Object.keys(current)])
  for (const key of [...keys].sort()) {
    const a = baseline[key], b = current[key]
    if (!a || !b) { diffs.push({ key, note: !a ? 'missing in baseline' : 'missing in current' }); continue }
    if (a.error || b.error) { diffs.push({ key, note: `capture error: ${a.error || b.error}` }); continue }
    if (a.length !== b.length) diffs.push({ key, note: `element count ${a.length} -> ${b.length}` })
    const n = Math.min(a.length, b.length)
    for (let i = 0; i < n; i += 1) {
      if (a[i].sel !== b[i].sel) { diffs.push({ key, note: `selector order changed at ${i}` }); break }
      for (const p of Object.keys(a[i].styles)) {
        if (a[i].styles[p] !== b[i].styles[p]) {
          diffs.push({ key, sel: a[i].sel, nth: a[i].i, prop: p, from: a[i].styles[p], to: b[i].styles[p] })
        }
      }
    }
  }
  return diffs
}

if (compareTo) {
  const baseline = loadSnapshot(compareTo)
  console.log('[css-equivalence] capturing current state...')
  const { snapshot } = await capture()
  const diffs = diff(baseline, snapshot)
  if (diffs.length === 0) {
    console.log('\n[css-equivalence] PASS — zero computed-style differences')
    process.exit(0)
  }
  console.error(`\n[css-equivalence] FAIL — ${diffs.length} computed-style difference(s)\n`)
  for (const d of diffs.slice(0, 60)) {
    console.error(d.note ? `  ${d.key}: ${d.note}` : `  ${d.key}  ${d.sel}[${d.nth}]  ${d.prop}: ${d.from}  ->  ${d.to}`)
  }
  if (diffs.length > 60) console.error(`  ... and ${diffs.length - 60} more`)
  process.exit(1)
} else {
  const dir = writeTo || 'artifacts/css-equivalence/current'
  console.log(`[css-equivalence] capturing -> ${dir}`)
  const { snapshot, elementCount } = await capture()
  const target = path.join(ROOT, dir)
  fs.mkdirSync(target, { recursive: true })
  const file = path.join(target, SNAPSHOT_FILE)
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(snapshot), { level: 9 }))
  const bytes = fs.statSync(file).size
  console.log(`\n[css-equivalence] wrote ${path.relative(ROOT, file)}`)
  console.log(`  combinations : ${Object.keys(snapshot).length} (${ROUTES.length} routes x ${THEMES.length} themes x ${VIEWPORTS.length} viewports)`)
  console.log(`  elements     : ${elementCount}`)
  console.log(`  properties   : ${PROPS.length} per element`)
  console.log(`  data points  : ${elementCount * PROPS.length}`)
  console.log(`  size         : ${(bytes / 1024 / 1024).toFixed(2)} MB`)
}
