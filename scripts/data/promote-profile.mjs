#!/usr/bin/env node
/**
 * One-command profile promotion — the clean, deterministic, drift-free path.
 *
 * Promoting a curated profile used to be a fragile manual sequence (edit the
 * binary workbook → rebuild → refresh the detail file → prove no drift → prove
 * the source gate). Getting it wrong meant either a broken profile or a diff
 * that rewrote ~855 unrelated records. This tool encapsulates the whole flow so
 * the next promotion is a single command.
 *
 * WHAT IT DOES (in order):
 *   1. Validates the slug exists and is not restricted / high-risk.
 *   2. Edits ONLY the workbook cells that gate visibility, via the surgical
 *      Entity_Master cell editor (never a full ExcelJS rewrite):
 *        - runtime_export_decision -> a publishable value (default full_public_runtime)
 *        - summary                 -> (optional) a cleaned, grounded summary
 *   3. Regenerates public/data with the CORE pipeline only (`data:build:core`
 *      equivalent). It deliberately does NOT run the full `data:build`, whose
 *      governance overlay + postprocess steps rewrite governance/safety fields on
 *      every record and are never committed by the deploy path (build:fast ->
 *      data:build:core). Running the full build for a single promotion is THE
 *      drift trap this tool exists to prevent.
 *   4. Refreshes only the promoted slug's detail file (summary + indexability
 *      mirror) so a now-published profile never ships stale/leaked text.
 *   5. Prints the resulting indexability state, the governance source-gate
 *      verdict (source-backed-by-citation / curated-allowlist / would-downgrade),
 *      and a `git diff --stat public/data` so you can see the diff is tight.
 *
 * THE TWO GATES (why a profile is / isn't indexable):
 *   - LIVE gate (decides the deployed site): `indexability-policy.mjs`, applied
 *     inside build-runtime-from-workbook. A profile is PUBLISH when its
 *     runtime_export_decision is publishable AND its content scores >= 75.
 *     THIS is what this tool flips.
 *   - GOVERNANCE gate (a CHECK, runs in `check:data` / audits, NOT in deploy):
 *     `apply-governance-overlay.mjs` downgrades an indexable profile that lacks
 *     real sources to NEEDS_REVIEW. To keep `check:data` clean, the slug must be
 *     source-backed — either it carries a real citation AND is registered in
 *     SOURCE_BACKED_PROMOTION_SLUGS, or it is on the curated index allowlist.
 *     This tool REPORTS that verdict; it does not edit source code. If the
 *     verdict is "would-downgrade", add the slug to SOURCE_BACKED_PROMOTION_SLUGS
 *     (preferred, real-citation path) — see docs/promoting-profiles.md.
 *
 * USAGE:
 *   node scripts/data/promote-profile.mjs --check --slug chamomile
 *   node scripts/data/promote-profile.mjs --slug chamomile --dry-run
 *   node scripts/data/promote-profile.mjs --slug chamomile \
 *     --summary "Careful grounded summary here."
 *   node scripts/data/promote-profile.mjs --slug chamomile --decision full_public_runtime
 *
 * FLAGS:
 *   --slug <slug>       Required. Entity_Master slug to promote.
 *   --check             Read-only. Print current state + gate verdict; change nothing.
 *   --summary "<text>"  Optional. Replace the workbook summary (use to clean leaked text).
 *   --decision <value>  Publishable runtime_export_decision. Default: full_public_runtime.
 *   --no-detail         Skip the single detail-file refresh (step 4).
 *   --dry-run           Print the planned workbook edits + gate verdict; do not write or rebuild.
 *   --help
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { scoreIndexability } from './indexability-policy.mjs'

const ROOT = process.cwd()
const OVERLAY_SRC = path.join(ROOT, 'scripts/data/apply-governance-overlay.mjs')
const EDITOR = path.join(ROOT, 'scripts/data/edit-entity-master-cell.mjs')

const PUBLISHABLE_DECISIONS = new Set(['full_public_runtime', 'primary_runtime_priority', 'publish', 'publishable', 'ready'])
const LEAK_PATTERNS = [
  /decision-ready summary:/i,
  /entry from .* evidence pass/i,
  /no summary available/i,
  /\bplaceholder\b/i,
  /evidence level:\s*\w+\.?$/i,
]

// The ONLY correct rebuild for a committed single-profile change: mirrors
// `npm run data:build:core`. NOT full `data:build` (see file header — drift trap).
const CORE_REBUILD_STEPS = [
  ['scripts/data/build-runtime-from-workbook.mjs', ['--out', 'public/data']],
  ['scripts/data/build-runtime-summary-indexes.mjs', ['--data-dir=public/data']],
  ['scripts/data/build-export-batches.mjs', ['--data-dir=public/data']],
  ['scripts/data/build-search-index.mjs', ['--data-dir=public/data']],
]

function die(msg) {
  console.error(`\n[promote-profile] ERROR: ${msg}\n`)
  process.exit(1)
}

function parseArgs(argv) {
  const args = { slug: '', summary: null, decision: 'full_public_runtime', check: false, dryRun: false, detail: true }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') { printHelp(); process.exit(0) }
    else if (a === '--check') args.check = true
    else if (a === '--dry-run') args.dryRun = true
    else if (a === '--no-detail') args.detail = false
    else if (a === '--slug') args.slug = argv[++i] || ''
    else if (a === '--summary') args.summary = argv[++i] ?? null
    else if (a === '--decision') args.decision = argv[++i] || ''
    else die(`unknown argument: ${a} (see --help)`)
  }
  return args
}

function printHelp() {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith(' *') || l.startsWith('/**')).join('\n'))
}

function readJson(rel, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) } catch { return fallback }
}

function asRows(raw) {
  return Array.isArray(raw) ? raw : raw?.items || raw?.data || []
}

/** Parse the string literals of a named `new Set([...])` from the overlay source (single source of truth). */
function parseSet(source, setName) {
  const start = source.indexOf(`${setName} = new Set([`)
  if (start === -1) return new Set()
  const open = source.indexOf('[', start)
  const close = source.indexOf('])', open)
  const body = source.slice(open + 1, close)
  const out = new Set()
  for (const m of body.matchAll(/['"]([^'"]+)['"]/g)) out.add(m[1])
  return out
}

/** Real citation ids for a slug from claims.json (pmid / doi / source_url). */
function claimSourceIds(claims, slug) {
  const ids = []
  for (const c of claims) {
    if (String(c?.profile_slug || '').trim() !== slug) continue
    if (c.pmid) ids.push(`pmid:${c.pmid}`)
    if (c.doi) ids.push(`doi:${c.doi}`)
    if (c.source_url) ids.push(String(c.source_url))
  }
  return [...new Set(ids)]
}

function recordSourceIds(record) {
  const out = []
  for (const s of Array.isArray(record?.sources) ? record.sources : []) {
    if (!s) continue
    if (typeof s === 'string') { out.push(s); continue }
    const id = s.pubmedId || s.pmid || s.id || s.doi || s.url
    if (id) out.push(String(id))
  }
  return out
}

/** Resolve a slug to its runtime record + kind, reading the committed generated data. */
function resolveRecord(slug) {
  const herbs = asRows(readJson('public/data/herbs.json', [])).map((r) => ({ r, kind: 'herbs' }))
  const comps = asRows(readJson('public/data/compounds.json', [])).map((r) => ({ r, kind: 'compounds' }))
  return [...herbs, ...comps].find((x) => x.r?.slug === slug) || null
}

/** Compute the governance source-gate verdict exactly as apply-governance-overlay would. */
function gateVerdict(slug, record, kind) {
  const overlay = fs.readFileSync(OVERLAY_SRC, 'utf8')
  const restricted = parseSet(overlay, 'RESTRICTED_SLUGS')
  const sourceBacked = parseSet(overlay, 'SOURCE_BACKED_PROMOTION_SLUGS')
  const curatedHerb = parseSet(overlay, 'CURATED_HERB_SLUGS')
  const curatedCompound = parseSet(overlay, 'CURATED_COMPOUND_SLUGS')
  const claims = asRows(readJson('public/data/claims.json', []))

  const isRestricted = restricted.has(slug)
  const isCurated = (kind === 'herbs' && curatedHerb.has(slug)) || (kind === 'compounds' && curatedCompound.has(slug))
  const registered = sourceBacked.has(slug)
  const recordIds = recordSourceIds(record)
  const citationIds = registered ? claimSourceIds(claims, slug) : []
  const hasSources = recordIds.length > 0 || citationIds.length > 0 || isCurated

  let path = 'none'
  if (recordIds.length > 0) path = 'record-level sources'
  else if (registered && citationIds.length > 0) path = 'real citation (SOURCE_BACKED_PROMOTION_SLUGS)'
  else if (isCurated) path = 'curated index allowlist'

  return {
    isRestricted,
    hasSources,
    path,
    registered,
    isCurated,
    citationIds,
    recordIds,
    allCitationsAvailable: claimSourceIds(claims, slug),
  }
}

function run(cmd, cmdArgs, { capture = true } = {}) {
  try {
    const out = execFileSync('node', [cmd, ...cmdArgs], { cwd: ROOT, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' })
    return { ok: true, out }
  } catch (e) {
    return { ok: false, out: `${e.stdout || ''}${e.stderr || ''}` }
  }
}

function coreRebuild() {
  for (const [script, scriptArgs] of CORE_REBUILD_STEPS) {
    const res = run(script, scriptArgs)
    if (!res.ok) die(`core rebuild step failed: ${script}\n${res.out.split('\n').slice(-12).join('\n')}`)
  }
  // build-info timestamp is pipeline noise (guard-generated-data ignores it); keep the diff clean.
  try {
    execFileSync('git', ['checkout', '--', 'public/data/_meta/build-info.json'], { cwd: ROOT, stdio: 'ignore' })
  } catch { /* build-info may be untracked or unchanged; ignore */ }
}

/** Mirror the promoted record's cleaned summary + indexability into its single detail file. */
function refreshDetailFile(slug, kind) {
  const dir = kind === 'herbs' ? 'herbs-detail' : 'compounds-detail'
  const file = path.join(ROOT, 'public/data', dir, `${slug}.json`)
  if (!fs.existsSync(file)) return { skipped: 'no detail file' }
  const rec = resolveRecord(slug)?.r
  if (!rec) return { skipped: 'record not found' }
  const detail = JSON.parse(fs.readFileSync(file, 'utf8'))
  const target = detail && typeof detail === 'object' && detail.record && typeof detail.record === 'object' ? detail.record : detail
  const MIRROR = ['summary', 'description', 'runtime_export_decision', 'indexability_status', 'indexability_score', 'robots', 'sitemap_included']
  for (const f of MIRROR) if (f in rec) target[f] = rec[f]
  fs.writeFileSync(file, `${JSON.stringify(detail, null, 2)}\n`)
  return { updated: path.relative(ROOT, file) }
}

function printState(label, record, kind) {
  const s = scoreIndexability(record, { type: kind === 'herbs' ? 'herb' : 'compound' })
  console.log(`  ${label}: ${s.status} (score ${s.score}) | robots=${record.robots} | sitemap=${record.sitemap_included} | decision=${record.runtime_export_decision}`)
}

// ---- main ----------------------------------------------------------------
const args = parseArgs(process.argv)
if (!args.slug) die('--slug is required (see --help)')

const resolved = resolveRecord(args.slug)
if (!resolved) die(`slug "${args.slug}" not found in public/data/herbs.json or compounds.json`)
const { r: record, kind } = resolved

const verdict = gateVerdict(args.slug, record, kind)
if (verdict.isRestricted) die(`slug "${args.slug}" is restricted/high-risk and must never be auto-promoted`)

console.log(`\n[promote-profile] ${args.slug} (${kind})`)
printState('current', record, kind)

// Simulate the LIVE gate on the content as-is, if the holdback were lifted.
const simType = kind === 'herbs' ? 'herb' : 'compound'
const sim = scoreIndexability({ ...record, runtime_export_decision: args.decision }, { type: simType })
console.log(`  if promoted (content as-is): ${sim.status} (score ${sim.score})`)
if (sim.status !== 'PUBLISH') {
  const capped = /research_only|minimal/i.test(String(record.profile_status))
  console.log(`  ⚠ promotion would land at ${sim.status}, not PUBLISH${capped ? ` — capped by profile_status="${record.profile_status}" (needs editorial certification, not just a holdback lift)` : ' — improve summary/effects/mechanism/safety first'}.`)
}

// Governance source-gate verdict
console.log('\n[promote-profile] governance source-gate (the check:data / audit gate):')
if (verdict.hasSources) {
  console.log(`  ✓ source-backed via ${verdict.path}`)
  if (verdict.citationIds.length) console.log(`    citations counted: ${verdict.citationIds.join(', ')}`)
} else {
  console.log('  ✗ NOT source-backed — the governance overlay would downgrade this to NEEDS_REVIEW in check:data.')
  if (verdict.allCitationsAvailable.length) {
    console.log(`    A citation is present in claims.json (${verdict.allCitationsAvailable.join(', ')}) — verify it is a real PMID/DOI before relying on it.`)
    console.log(`    Fix: add '${args.slug}' to SOURCE_BACKED_PROMOTION_SLUGS in scripts/data/apply-governance-overlay.mjs.`)
  } else {
    console.log('    No citation found in claims.json. Add a real Evidence_Register citation first; do not use the allowlist as a shortcut.')
  }
}

// Leaked-text warning
const summaryNow = String(record.summary || record.description || '')
if (LEAK_PATTERNS.some((re) => re.test(summaryNow.trim())) && args.summary == null) {
  console.log('\n[promote-profile] WARNING: current summary contains leaked pipeline/placeholder text.')
  console.log('  Pass --summary "<clean grounded text>" to replace it as part of this promotion.')
}

if (args.check) {
  console.log('\n[promote-profile] --check: read-only, nothing changed.\n')
  process.exit(0)
}

// Plan the workbook edits
const edits = []
if (!PUBLISHABLE_DECISIONS.has(args.decision)) die(`--decision "${args.decision}" is not a publishable value (${[...PUBLISHABLE_DECISIONS].join(', ')})`)
if (String(record.runtime_export_decision) !== args.decision) edits.push(['runtime_export_decision', args.decision])
if (args.summary != null) edits.push(['summary', args.summary])

if (!edits.length) {
  console.log('\n[promote-profile] No workbook edits needed (already at target decision, no summary change). Nothing to do.\n')
  process.exit(0)
}

console.log('\n[promote-profile] planned workbook edits (Entity_Master):')
for (const [col, val] of edits) console.log(`  ${col} = ${String(val).length > 80 ? `${String(val).slice(0, 77)}...` : val}`)

if (args.dryRun) {
  console.log('\n[promote-profile] --dry-run: no workbook write, no rebuild.\n')
  process.exit(0)
}

// 2. Apply workbook edits
for (const [col, val] of edits) {
  const res = run(EDITOR, ['--slug', args.slug, '--column', col, '--value', String(val), '--in-place'])
  if (!res.ok) die(`workbook edit failed for column "${col}":\n${res.out.split('\n').slice(-10).join('\n')}`)
}
console.log('[promote-profile] workbook updated.')

// 3. Core rebuild (drift-free)
console.log('[promote-profile] regenerating public/data (core pipeline)...')
coreRebuild()

// 4. Refresh the single detail file
if (args.detail) {
  const d = refreshDetailFile(args.slug, kind)
  if (d.updated) console.log(`[promote-profile] refreshed detail file: ${d.updated}`)
  else console.log(`[promote-profile] detail file not refreshed (${d.skipped}).`)
}

// 5. Verify + show the diff surface
const after = resolveRecord(args.slug)?.r
console.log('')
printState('promoted', after, kind)
console.log('\n[promote-profile] public/data diff surface:')
try {
  const stat = execFileSync('git', ['diff', '--stat', '--', 'public/data'], { cwd: ROOT, encoding: 'utf8' })
  console.log(stat.split('\n').map((l) => `  ${l}`).join('\n'))
} catch { /* ignore */ }

console.log('[promote-profile] Done. Review the diff, then run: npm run guard:source-of-truth && npm run validate:evidence-language\n')
