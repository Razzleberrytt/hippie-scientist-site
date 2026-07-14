#!/usr/bin/env node

// Guards against a real bug class found in production data (see
// docs/LOOP_NOTES.md, 2026-07-13): deriveInteractionData() in
// scripts/data/build-interaction-data.mjs matches risk keywords via plain
// String.includes(), with no word-boundary check. A keyword that happens to
// be a complete word (e.g. "liver") can match as a substring of an unrelated
// word (e.g. "delivery"), silently mislabeling an entity's risk mechanism.
//
// Legitimate matches are routinely formed by a medical prefix glued directly
// onto the keyword with no separator (e.g. "antidiabetic" -> "diabet",
// "hypertension" -> "hypertens") — those must NOT be flagged. This script
// flags only matches preceded by a letter that does NOT form one of those
// known-safe prefixes, so it can run over the real workbook with zero
// expected findings today and catch new collisions introduced by future
// enrichment edits before they reach entity_risk_tags.json.
//
// Informational by default (exit 0) since prefix curation is inherently
// incomplete; pass --strict to exit 1 on any finding (e.g. for a future,
// deliberate CI gate once the allowlist has proven itself over time).

import { assertWorkbookExists, resolveWorkbookPath } from './workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './data/workbook-parser.mjs'
import { KEYWORDS } from './data/build-interaction-data.mjs'

const ENTITY_SHEET_CANDIDATES = ['Entity_Master', 'Sheet7']

// Prefixes that legitimately glue onto a keyword stem with no separator.
// Extend this list (not the matcher) when a new legitimate compound term
// is found — do not weaken the boundary check itself.
const ALLOWED_PREFIXES = [
  'anti', 'hyper', 'hypo', 'para', 'non', 'pre', 'post',
  'sub', 'poly', 'dys', 'over', 'under', 'co', 're',
]

function clean(value) {
  return String(value ?? '').trim()
}

function splitFlags(v) {
  return v == null ? [] : String(v).split(/[;,]/).map((s) => s.trim()).filter(Boolean)
}

export function findSuspectMatches(phrase) {
  const pl = phrase.toLowerCase()
  const suspects = []
  for (const [mech, keys] of Object.entries(KEYWORDS)) {
    for (const key of keys) {
      let from = 0
      let idx
      while ((idx = pl.indexOf(key, from)) !== -1) {
        from = idx + 1
        const before = idx > 0 ? pl[idx - 1] : ''
        if (/[a-z]/.test(before)) {
          let start = idx
          while (start > 0 && /[a-z]/.test(pl[start - 1])) start--
          const prefix = pl.slice(start, idx)
          if (!ALLOWED_PREFIXES.includes(prefix)) {
            suspects.push({ mech, key, prefix, phrase })
          }
        }
      }
    }
  }
  return suspects
}

// Second bug class, found by an external reviewer (see docs/LOOP_NOTES.md,
// 2026-07-14, PR #2274): a keyword can be a clean, correctly word-boundaried
// whole-word match and still be semantically unrelated to the mechanism it
// triggers. `surgery` is in KEYWORDS.anticoagulant because "discontinue
// before surgery due to bleeding risk" is a common, legitimate clause — but
// clinicians also cite surgery for sedation, anesthesia-interaction, or
// general-precaution reasons that have nothing to do with bleeding. That
// shipped as a real bug: catuaba's "discontinue before scheduled surgery due
// to an unstudied interaction with anesthesia" clause was silently tagged an
// anticoagulant/bleeding risk. findSuspectMatches() cannot catch this — the
// match isn't a substring collision, it's a semantically loose keyword.
//
// A first version of this check required a corroborating term (e.g. "bleed",
// "clot") anywhere in the same clause — but the real workbook's established
// convention is short standalone flags like "pre-surgery" or "upcoming
// surgery" (no restated mechanism) for well-documented antiplatelet herbs
// (garlic, danshen, notoginseng, ...), so that version flagged 14 legitimate
// entries as false positives on real data. Only flag an *explanatory*
// clause — one that explicitly gives an causal reason via "due to"/"because
// of" — where that stated reason doesn't corroborate bleeding. A bare flag
// token with no stated reason is left alone; that's the dataset's normal
// shorthand, not a bug.
const CORROBORATION_REQUIRED = {
  anticoagulant: {
    keys: ['surgery', 'pre-surgery'],
    corroborators: [
      'bleed', 'clot', 'coagul', 'platelet', 'inr', 'hemorrhage', 'haemorrhage',
      'blood-thinning', 'blood thinning', 'thin the blood', 'thins the blood',
    ],
  },
}
const REASON_MARKERS = ['due to', 'because of', 'because ']

export function findWeakCorroborationMatches(phrase) {
  const pl = phrase.toLowerCase()
  const suspects = []
  for (const [mech, { keys, corroborators }] of Object.entries(CORROBORATION_REQUIRED)) {
    const matchedKey = keys.find((k) => pl.includes(k))
    if (!matchedKey) continue
    const reasonIdx = Math.min(
      ...REASON_MARKERS.map((m) => pl.indexOf(m)).filter((i) => i !== -1),
      Infinity
    )
    if (!Number.isFinite(reasonIdx)) continue // bare flag token, no stated reason — established shorthand, not a bug
    const stated = pl.slice(reasonIdx)
    if (!corroborators.some((c) => stated.includes(c))) {
      suspects.push({ mech, key: matchedKey, phrase })
    }
  }
  return suspects
}

async function main() {
  const strict = process.argv.includes('--strict')
  const workbookPath = resolveWorkbookPath(process.cwd())
  assertWorkbookExists(workbookPath)
  const wb = await readWorkbook(workbookPath)

  const sheetName = ENTITY_SHEET_CANDIDATES.find((c) => getSheet(wb, c))
  if (!sheetName) {
    console.error(`[audit:risk-tag-collisions] missing required sheet: ${ENTITY_SHEET_CANDIDATES.join(' or ')}`)
    process.exit(1)
  }
  const rows = sheetToRows(getSheet(wb, sheetName))

  const findings = []
  const weakFindings = []
  for (const row of rows) {
    const slug = clean(row.slug)
    for (const phrase of splitFlags(row.contraindications_or_flags)) {
      for (const suspect of findSuspectMatches(phrase)) {
        findings.push({ slug, ...suspect })
      }
      for (const suspect of findWeakCorroborationMatches(phrase)) {
        weakFindings.push({ slug, ...suspect })
      }
    }
  }

  if (findings.length === 0) {
    console.log('[audit:risk-tag-collisions] clean — no unboundaried keyword matches found in contraindications_or_flags')
  } else {
    console.log(`[audit:risk-tag-collisions] ${findings.length} potential substring-collision false positive(s):\n`)
    for (const f of findings) {
      console.log(`  ${f.slug} — mechanism "${f.mech}" matched "${f.key}" via prefix "${f.prefix}" in: "${f.phrase}"`)
    }
    console.log('\nIf a finding is a genuine new compound term (e.g. a novel medical prefix), add the prefix to')
    console.log('ALLOWED_PREFIXES in this script. Otherwise, reword the clause in the workbook to break the collision')
    console.log('(see docs/LOOP_NOTES.md, 2026-07-13 post-merge addendum, for a worked example).')
  }

  if (weakFindings.length === 0) {
    console.log('[audit:risk-tag-collisions] clean — no weak-corroboration keyword matches found in contraindications_or_flags')
  } else {
    console.log(`\n[audit:risk-tag-collisions] ${weakFindings.length} weak-corroboration false positive(s):\n`)
    for (const f of weakFindings) {
      console.log(`  ${f.slug} — mechanism "${f.mech}" matched "${f.key}" with no corroborating term in: "${f.phrase}"`)
    }
    console.log('\nThe clause matches a mechanism keyword that is broad enough to appear in unrelated contexts (e.g.')
    console.log('"surgery" cited for sedation/anesthesia reasons, not bleeding risk). Reword the clause to either name')
    console.log('the real mechanism explicitly, or add a corroborating term so the tag is intentional, not accidental')
    console.log('(see docs/LOOP_NOTES.md, 2026-07-14, PR #2274, for the production bug this guards against).')
  }

  process.exit(strict && (findings.length > 0 || weakFindings.length > 0) ? 1 : 0)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
