#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'public', 'data', 'reports')
const argv = process.argv.slice(2)
const flagValue = (name) => argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const BASE_REF = flagValue('base') || (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'HEAD^')
const STRICT = argv.includes('--strict')

function run(command, args, cwd = ROOT, options = {}) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: options.quiet ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'],
    maxBuffer: 50 * 1024 * 1024,
  })
}

function normalizeRoute(value) {
  const raw = String(value ?? '').trim().split(/[?#]/)[0]
  if (!raw) return ''
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function readMap(worktree) {
  const file = path.join(worktree, 'public', 'data', 'runtime-maps', 'internal-link-map.json')
  const raw = fs.readFileSync(file, 'utf8').trim()
  if (!raw) throw new Error(`generated internal-link map is empty in ${worktree}`)
  const parsed = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`generated internal-link map is not an object in ${worktree}`)
  }
  return parsed
}

function snapshot(map) {
  const byRoute = {}
  let total = 0
  for (const [mapKey, row] of Object.entries(map)) {
    const route = normalizeRoute(row?.route || mapKey)
    if (!route) continue
    const links = Number(row?.totalLinks ?? row?.total_links ?? row?.links?.length ?? row?.groups?.flatMap?.((group) => group?.links || [])?.length ?? 0) || 0
    byRoute[route] = links
    total += links
  }
  return { total, routes: Object.keys(byRoute).length, byRoute }
}

function compare(before, after) {
  const lostRoutes = []
  const reducedRoutes = []
  const addedRoutes = []
  for (const [route, count] of Object.entries(before.byRoute)) {
    const next = Number(after.byRoute[route] ?? 0)
    if (count > 0 && next === 0) lostRoutes.push({ route, before: count, after: next })
    else if (next < count) reducedRoutes.push({ route, before: count, after: next })
  }
  for (const [route, count] of Object.entries(after.byRoute)) {
    if (!(route in before.byRoute) && count > 0) addedRoutes.push({ route, before: 0, after: count })
  }

  const delta = after.total - before.total
  const pct = before.total ? delta / before.total : null
  const majorRegression = (pct !== null && pct <= -0.1 && delta <= -50) || lostRoutes.length >= 10
  return {
    before: { total: before.total, routes: before.routes },
    after: { total: after.total, routes: after.routes },
    delta,
    pct,
    majorRegression,
    lostRoutes: lostRoutes.sort((a, b) => b.before - a.before || a.route.localeCompare(b.route)),
    reducedRoutes: reducedRoutes.sort((a, b) => (b.before - b.after) - (a.before - a.after) || a.route.localeCompare(b.route)),
    addedRoutes: addedRoutes.sort((a, b) => b.after - a.after || a.route.localeCompare(b.route)),
  }
}

function renderMarkdown(report) {
  const c = report.comparison
  const pct = c.pct === null ? 'n/a' : `${(c.pct * 100).toFixed(1)}%`
  const lines = [
    '# Internal-link regression comparison',
    '',
    `Base: \`${report.baseRef}\``,
    '',
    `Both maps were **regenerated from their own Git worktrees** before comparison; this audit does not trust the currently tracked empty/stale map artifact.`,
    '',
    '| Signal | Previous | Current | Delta |',
    '| --- | ---: | ---: | ---: |',
    `| Routes represented | ${c.before.routes} | ${c.after.routes} | ${c.after.routes - c.before.routes} |`,
    `| Related internal links | ${c.before.total} | ${c.after.total} | ${c.delta >= 0 ? '+' : ''}${c.delta} (${pct}) |`,
    `| Routes losing all related links | — | ${c.lostRoutes.length} | — |`,
    `| Routes with reduced related links | — | ${c.reducedRoutes.length} | — |`,
    '',
  ]
  if (c.lostRoutes.length) {
    lines.push('## Routes that lost all generated related links', '')
    for (const row of c.lostRoutes.slice(0, 100)) lines.push(`- \`${row.route}\`: ${row.before} → ${row.after}`)
    lines.push('')
  }
  if (c.majorRegression) lines.push('## Result', '', '**FAIL:** major internal-link regression detected.', '')
  else lines.push('## Result', '', 'No major internal-link regression detected.', '')
  return `${lines.join('\n')}\n`
}

function createWorktree(ref, label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ths-${label}-`))
  fs.rmSync(dir, { recursive: true, force: true })
  run('git', ['worktree', 'add', '--detach', dir, ref], ROOT, { quiet: true })
  return dir
}

function shareDependencies(worktree) {
  const source = path.join(ROOT, 'node_modules')
  const target = path.join(worktree, 'node_modules')
  if (!fs.existsSync(source)) {
    throw new Error('node_modules is missing in the root checkout; install dependencies before running the worktree comparison')
  }
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true })
  fs.symlinkSync(source, target, process.platform === 'win32' ? 'junction' : 'dir')
}

function removeWorktree(dir) {
  if (!dir) return
  try {
    run('git', ['worktree', 'remove', '--force', dir], ROOT, { quiet: true })
  } catch {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

let baseWorktree = ''
let currentWorktree = ''
try {
  baseWorktree = createWorktree(BASE_REF, 'links-base')
  currentWorktree = createWorktree('HEAD', 'links-current')
  shareDependencies(baseWorktree)
  shareDependencies(currentWorktree)

  run(process.execPath, ['scripts/data/build-internal-link-engine.mjs'], baseWorktree, { quiet: true })
  run(process.execPath, ['scripts/data/build-internal-link-engine.mjs'], currentWorktree, { quiet: true })

  const before = snapshot(readMap(baseWorktree))
  const after = snapshot(readMap(currentWorktree))
  const comparison = compare(before, after)
  const report = {
    generatedAt: new Date().toISOString(),
    baseRef: BASE_REF,
    comparison,
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(path.join(REPORT_DIR, 'internal-link-quality-diff.json'), `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(path.join(REPORT_DIR, 'internal-link-quality-diff.md'), renderMarkdown(report))

  console.log('\nInternal-link regression comparison')
  console.log('='.repeat(72))
  console.log(`Base ref            ${BASE_REF}`)
  console.log(`Routes              ${before.routes} → ${after.routes}`)
  console.log(`Internal links       ${before.total} → ${after.total} (${comparison.delta >= 0 ? '+' : ''}${comparison.delta})`)
  console.log(`Lost-link routes     ${comparison.lostRoutes.length}`)
  console.log(`Reduced-link routes  ${comparison.reducedRoutes.length}`)
  console.log('Report               public/data/reports/internal-link-quality-diff.md')

  if (STRICT && comparison.majorRegression) process.exitCode = 1
} finally {
  removeWorktree(currentWorktree)
  removeWorktree(baseWorktree)
}
