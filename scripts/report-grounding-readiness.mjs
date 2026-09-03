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
 * Usage:
 *   node scripts/report-grounding-readiness.mjs [slug ...]
 *   node scripts/report-grounding-readiness.mjs --all [--data-dir=out/data] [--json=<path>]
 *
 * --all ranks every held profile instead of the curated shortlist. This is the
 * question that matters for traffic: the site authors 856 profiles and publishes
 * ~306, so knowing which of the ~550 held ones are content-ready — versus which
 * need grounding work — is the difference between a prioritized backlog and an
 * opaque wall.
 *
 * --data-dir matters more than it looks. `public/data` in a fresh checkout is
 * parser output: its indexability_status is what the workbook asserted, BEFORE
 * apply-governance-overlay.mjs decides what may actually be published, and it
 * overstates the publishable corpus by ~31%. Point this at `out/data` after a
 * build to score against what governance actually allows.
 */

const ROOT = process.cwd()
const DEFAULT_TARGETS = ['5-htp', 'gaba', 'n-acetylcysteine', 'citicoline', 'apigenin', 'lavender', 'lemon-balm', 'chamomile']

const argValue = (name, fallback = null) => {
  const hit = process.argv.find((v) => v.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}
const ALL = process.argv.includes('--all')
const DATA_DIR = argValue('data-dir', 'public/data')
const JSON_OUT = argValue('json', null)
const LIMIT = Number(argValue('limit', ALL ? '40' : '0')) || 0

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

const herbs = load(`${DATA_DIR}/herbs.json`).map((r) => ({ ...r, _k: 'herb' }))
const comps = load(`${DATA_DIR}/compounds.json`).map((r) => ({ ...r, _k: 'compound' }))
const bySlug = new Map([...herbs, ...comps].map((r) => [r.slug, r]))

const explicitSlugs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const targets = ALL
  ? [...herbs, ...comps].filter((r) => r.indexability_status !== 'PUBLISH').map((r) => r.slug)
  : explicitSlugs.length ? explicitSlugs : DEFAULT_TARGETS

if (DATA_DIR === 'public/data' && ALL) {
  console.warn('\n[grounding] WARNING: public/data is pre-governance and overstates the publishable corpus by ~31%.')
  console.warn('[grounding] Run `npm run build` and re-run with --data-dir=out/data for the real picture.')
}

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

  // scoreIndexability measures structural completeness — identity, mechanism
  // text, effects, summary shape. It does NOT look at whether any study backs
  // the profile, which is the thing `hidden_until_grounded` is actually holding
  // for. A profile can score 100 and still cite nothing, so grounding has to be
  // read separately or the score reads as "safe to publish" when it is not.
  const recordedStudies = Number(r.evidence_recorded_study_count) || 0
  const humanStudies = Number(r.evidence_human_study_count) || 0
  const decisionRaw = String(r.runtime_export_decision || '').toLowerCase()
  const reasonText = JSON.stringify(r.indexability_reasons ?? [])
  const aliasOnly = /alias_redirect_only|deprecated/.test(`${decisionRaw} ${reasonText}`)

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
    recordedStudies,
    humanStudies,
    grounded: recordedStudies > 0,
    aliasOnly,
    gaps: promoted.reasons.filter((x) => /missing|thin|too-thin|non-publishable/.test(x)),
  })
}

const pad = (v, n) => String(v ?? '').padEnd(n)

if (ALL) {
  const scored = rows.filter((r) => r.verdict !== 'NOT_FOUND')
  // Highest score first: the closest a held profile is to passing the quality
  // gate, the less work it takes to turn into an indexable page.
  scored.sort((a, b) => b.promotedScore - a.promotedScore || a.slug.localeCompare(b.slug))

  const byVerdict = {}
  const byGap = {}
  for (const row of scored) {
    byVerdict[row.verdict] = (byVerdict[row.verdict] ?? 0) + 1
    for (const gap of row.gaps) byGap[gap] = (byGap[gap] ?? 0) + 1
  }

  console.log(`\nGrounding readiness — ${scored.length} held profile(s) in ${DATA_DIR} (read-only)\n`)
  console.log('  What each held profile would need to become an indexable page:')
  for (const [verdict, count] of Object.entries(byVerdict).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(count).padStart(4)}  ${verdict}`)
  }

  console.log('\n  Most common blocking gaps (a profile can have several):')
  for (const [gap, count] of Object.entries(byGap).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`    ${String(count).padStart(4)}  ${gap}`)
  }

  const contentComplete = scored.filter((r) => r.verdict === 'READY_TO_PROMOTE' && !r.leaked && !r.aliasOnly)
  const grounded = contentComplete.filter((r) => r.grounded)
  const ungrounded = contentComplete.filter((r) => !r.grounded)

  const published = [...herbs, ...comps].filter((r) => r.indexability_status === 'PUBLISH')
  const publishedUngrounded = published.filter((r) => !(Number(r.evidence_recorded_study_count) > 0)).length

  console.log(`\n  ${contentComplete.length} profile(s) pass the content-completeness gate. Split by grounding:`)
  console.log(`    ${String(grounded.length).padStart(4)}  cite at least one recorded study  <- the real promotion queue`)
  console.log(`    ${String(ungrounded.length).padStart(4)}  cite nothing at all               <- held correctly; needs research, not a decision`)
  console.log('')
  console.log('  scoreIndexability measures structure — identity, mechanism text, effects, summary')
  console.log('  shape. It does not read evidence. A score of 100 with zero recorded studies means')
  console.log('  the profile is well-formed and unsourced, which is exactly what')
  console.log('  `hidden_until_grounded` exists to withhold. For comparison, only')
  console.log(`  ${publishedUngrounded} of ${published.length} already-published profiles (${(100 * publishedUngrounded / Math.max(published.length, 1)).toFixed(0)}%) cite nothing.`)

  if (grounded.length) {
    console.log('\n  Grounded and content-complete — promote these first:')
    for (const row of grounded.slice(0, LIMIT || grounded.length)) {
      console.log(`    ${pad(row.slug, 34)} ${pad(row.kind, 9)} score ${pad(row.promotedScore, 4)} studies=${pad(row.recordedStudies, 4)} human=${pad(row.humanStudies, 4)} held by ${row.heldBy}`)
    }
    if (LIMIT && grounded.length > LIMIT) console.log(`    … and ${grounded.length - LIMIT} more (raise --limit to list them)`)
  }

  const leaking = scored.filter((r) => r.leaked)
  if (leaking.length) {
    console.log(`\n  ${leaking.length} held profile(s) carry leaked pipeline text in the summary.`)
    console.log('  These must be cleaned before promotion regardless of score.')
  }
  const aliases = scored.filter((r) => r.aliasOnly)
  if (aliases.length) {
    console.log(`\n  ${aliases.length} held record(s) are alias/deprecated redirects and are not promotable pages.`)
  }

  if (JSON_OUT) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, JSON_OUT)), { recursive: true })
    fs.writeFileSync(path.resolve(ROOT, JSON_OUT), `${JSON.stringify({
      dataDir: DATA_DIR,
      heldProfiles: scored.length,
      byVerdict,
      byGap,
      contentComplete: contentComplete.map((r) => r.slug),
      groundedPromotionQueue: grounded.map((r) => r.slug),
      contentCompleteButUngrounded: ungrounded.map((r) => r.slug),
      rows: scored,
    }, null, 2)}\n`, 'utf8')
    console.log(`\n  Full report: ${JSON_OUT}`)
  }

  console.log('\n  Promotion is a governance act, not a script run. Nothing here changes data.')
  console.log('  Promote one at a time: npm run promote:profile -- --slug <slug>\n')
  process.exit(0)
}

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
console.log('\nTo PROMOTE a ready profile in one step (workbook edit + drift-free core rebuild + verify):')
console.log('  npm run promote:profile -- --slug <slug> [--summary "clean grounded text"]')
console.log('  npm run promote:check   -- --slug <slug>   # read-only gate + readiness readout')
console.log('Do NOT hand-run `npm run data:build` for a single promotion — its governance overlay rewrites')
console.log('~855 records and is not committed by the deploy path. See docs/promoting-profiles.md.\n')
