import fs from 'node:fs'
import path from 'node:path'
import { scoreIndexability } from './data/indexability-policy.mjs'

/**
 * Read-only grounding-readiness report for noindex profiles.
 *
 * For each target slug it reports:
 *   - current indexability status + the exact reason it is held
 *   - the "promoted" status/score IF the runtime_export_decision holdback were
 *     lifted (i.e. what the quality gate would decide on the content as-is)
 *   - a verdict: READY_TO_PROMOTE / NEEDS_CONTENT / NEEDS_EDITORIAL_CERT
 *   - leaked pipeline text in the summary that must be cleaned before publish
 *
 * It changes nothing. It exists so an operator can see, deterministically, which
 * governance-held profiles are content-ready to promote and which still need
 * grounding — without touching the source-of-truth workbook or generated JSON.
 *
 * Usage:  node scripts/report-grounding-readiness.mjs [slug ...]
 */

const ROOT = process.cwd()
const DEFAULT_TARGETS = ['5-htp', 'gaba', 'n-acetylcysteine', 'citicoline', 'apigenin', 'lavender', 'lemon-balm', 'chamomile']

// Holdback decisions that hard-gate a profile to NOINDEX before content scoring.
const HOLDBACK_DECISIONS = new Set(['hidden_until_grounded', 'research_archive_runtime'])
// A neutral, scoreable decision used to simulate "what would the quality gate say".
const SIM_DECISION = 'full_public_runtime'
// Leaked pipeline phrases that must never reach a published summary.
const LEAK_PATTERNS = [
  /decision-ready summary:/i,
  /entry from .* evidence pass/i,
  /no summary available/i,
  /\bplaceholder\b/i,
  /evidence level:\s*\w+\.?$/i,
]

function load(file) {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
  const rows = Array.isArray(raw) ? raw : raw.items || raw.data || []
  return rows
}

function len(v) {
  if (Array.isArray(v)) return v.length
  return v ? String(v).split(/[|;,\n]+/).filter((x) => x.trim()).length : 0
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_TARGETS

const herbs = load('public/data/herbs.json').map((r) => ({ ...r, _k: 'herb' }))
const comps = load('public/data/compounds.json').map((r) => ({ ...r, _k: 'compound' }))
const bySlug = new Map([...herbs, ...comps].map((r) => [r.slug, r]))

const rows = []
for (const slug of targets) {
  const r = bySlug.get(slug)
  if (!r) {
    rows.push({ slug, verdict: 'NOT_FOUND' })
    continue
  }
  const current = scoreIndexability(r, { type: r._k })
  const decision = String(r.runtime_export_decision || '').toLowerCase()
  const heldBy = HOLDBACK_DECISIONS.has(decision) ? decision : current.status === 'PUBLISH' ? '(already publishable)' : 'score'
  // Simulate: what would the quality gate decide on the content as-is, if promoted?
  const promoted = scoreIndexability({ ...r, runtime_export_decision: SIM_DECISION }, { type: r._k })
  const summary = String(r.summary || r.description || r.short_description || '')
  const leaked = LEAK_PATTERNS.some((re) => re.test(summary.trim()))

  let verdict
  if (promoted.status === 'PUBLISH') verdict = 'READY_TO_PROMOTE'
  else if (/research_only|minimal/i.test(String(r.profile_status))) verdict = 'NEEDS_EDITORIAL_CERT'
  else verdict = 'NEEDS_CONTENT'

  rows.push({
    slug,
    kind: r._k,
    current: current.status,
    heldBy,
    promotedStatus: promoted.status,
    promotedScore: promoted.score,
    profileStatus: String(r.profile_status || ''),
    summaryLen: summary.length,
    effects: len(r.primary_effects || r.effects),
    leaked,
    verdict,
    gaps: promoted.reasons.filter((x) => /missing|thin|too-thin|non-publishable/.test(x)),
  })
}

const pad = (v, n) => String(v ?? '').padEnd(n)
console.log('\nGrounding readiness (read-only; nothing was modified)\n')
console.log(
  pad('SLUG', 18),
  pad('CUR', 7),
  pad('HELD-BY', 22),
  pad('IF-PROMOTED', 14),
  pad('LEAK', 5),
  'VERDICT',
)
console.log('-'.repeat(96))
for (const r of rows) {
  if (r.verdict === 'NOT_FOUND') {
    console.log(pad(r.slug, 18), 'NOT FOUND in herbs/compounds data')
    continue
  }
  console.log(
    pad(r.slug, 18),
    pad(r.current, 7),
    pad(r.heldBy, 22),
    pad(`${r.promotedStatus}(${r.promotedScore})`, 14),
    pad(r.leaked ? 'YES' : '-', 5),
    r.verdict,
  )
}
console.log('\nLegend:')
console.log('  READY_TO_PROMOTE   — content already scores PUBLISH; lifting the holdback publishes it via the quality gate.')
console.log('  NEEDS_CONTENT      — improve the summary/fields; would land at NEEDS_REVIEW if promoted as-is.')
console.log('  NEEDS_EDITORIAL_CERT — profile_status caps the score; needs a human editorial completeness upgrade.')
console.log('  LEAK=YES           — summary contains pipeline/placeholder text that must be cleaned before publish.')
console.log('\nAll changes to these fields must be made in the source workbook (data-sources/herb_monograph_master.xlsx)')
console.log('then regenerated with `npm run data:build`. See docs/grounding-noindex-profiles.md.\n')
